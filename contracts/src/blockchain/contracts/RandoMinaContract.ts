import { Field, Poseidon, SmartContract, Struct, ZkProgram, method } from "o1js";


/**
 * Represents the public input parameters for a Pseudo-Random Number Generator (PRNG).
 * 
 * The PRNG algorithm is defined by the following parameters:
 * - networkState: The state of the network at the time of the PRNG computation. This value is used to ensure freshness of
 *     the random number. This provides the PRNG with the security guarantee against brute-force attacks, which could give
 *     an attacker an advantage in some contexts. This value could be either a single Mina blockchain network attribute, or
 *     a combination of them. It's important that this attribute is constant, unique and unpredictable for each Mina block.
 *     The proofs generated with this number will only be valid within the Mina block where this proof was generated.
 * - sender: The public key of the sender of the PRNG computation. This value is obtained by Poseidon-hasing the public key of the
 *    sender. This is the second part of the seed, and it is used as a global nonce, to ensure that the random numbers generated
 *    throughout the network have a unique seed component.
 * 
 * Additionally, the following private input is used:
 * - nonce: Any number, which is used as the "local seed/nonce" per (networkState, sender) pair. This enables each Mina address to
 *   be able to generate multiple (infinite) number of pseudo-random numbers in a single Mina block. If necesasry, nonce
 *   can also be used as a public input. This can be either done by extending the methods of the existing smart contract, or defining a new one.
 */
export class PublicPRNGParameters extends Struct({
    networkState: Field,
    sender: Field, // hash(publicKey)
}) {
}

/**
 * Zero-Knowledge circuit which represents an observation of a computation that generates a random
 * number using a specific pseudo-random number generator (PRNG) algorithm.
 */
export const RandomNumberObservationCircuit = ZkProgram({
    name: "RandomNumberGenerationObservationCircuit",
    publicInput: PublicPRNGParameters,
    publicOutput: Field,

    methods: {
        generateRandomNumber: {
            privateInputs: [Field],
            async method(parameters: PublicPRNGParameters, nonce: Field){
                return Poseidon.hash(
                    [
                        parameters.networkState, 
                        parameters.sender, 
                        nonce, // local seed/nonce
                    ]
                );
            }
        },
 

    },
});

export class RandomNumberObservationCircuitProof extends ZkProgram.Proof(RandomNumberObservationCircuit) {}

/**
 * Smart contract that verifies the observation of a computation of a PRNG algorithm and asserts that the
 * network state used as a seed is the state of the network in the current network block.
 * 
 * This smart contract is meant to be inherited by other smart contracts, which need to rely on pseudo-random
 * numbers with freshness guarantees. As such, this smart contract would be invoked by any other smart-contract,
 * which can either use it direclty or a parameter to another smart contract. In practice, this brings
 * smart contracts on Mina blockchain. Those will be used for zkLocus for various protocol and functioanlity
 * needs, which include, but are not limited to $ZKL.
 */
export class RandoMinaContract extends SmartContract {
    
    @method async verifyRandomNumber(observationProof: RandomNumberObservationCircuitProof){
        const claimedSender: Field = observationProof.publicInput.sender;
        claimedSender.assertEquals(Poseidon.hash(this.sender.getUnconstrained().toFields()));

        const claimedNetworkState: Field = observationProof.publicInput.networkState;
        this.network.stakingEpochData.ledger.hash.requireEquals(claimedNetworkState);
    }
}
