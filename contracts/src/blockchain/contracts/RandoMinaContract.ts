import { Field, Poseidon, SmartContract, Struct, ZkProgram, method } from "o1js";

export class PRNGParameters extends Struct({
    networkState: Field,
    nonce: Field,
}) {
}

/**
 * Zero-Knowledge circuit which represents an observation of a computation that generates a random
 * number using a specific pseudo-random number generator (PRNG) algorithm.
 */
export const RandomNumberObservationCircuit = ZkProgram({
    name: "RandomNumberGenerationObservationCircuit",
    publicInput: PRNGParameters,
    publicOutput: Field,

    methods: {
        generateRandomNumber: {
            privateInputs: [],
            method: (parameters: PRNGParameters): Field => {
                return Poseidon.hash([parameters.networkState, parameters.nonce]);
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
    
    @method verifyRandomNumber(observationProof: RandomNumberObservationCircuitProof): void {
        const claimedNetworkState: Field = observationProof.publicInput.networkState;
        this.network.stakingEpochData.ledger.hash.requireEquals(claimedNetworkState);
    }
}
