import { DeployArgs, PublicKey, SmartContract, State, state , Permissions, method, Field} from "o1js";

/**
 * `DeployeeSC` is a smart contract that is deployed by the `BountyBulletinBoardSC` smart contract.
 * It represents a specific instance of a bounty.
 *
 * @property {State<Field>} deployer - The Poseidon.hash() of the public key of the deployer of this smart contract
 * @property {State<PublicKey>} funder - The funder of this Bounty. The funder will be able to associate this bounty with a zkLocus proof
 *
 * @see {@link BountyBulletinBoardSC} for the smart contract that deploys instances of `BountySC`.
 */
export class DeployeeSC extends SmartContract {
    // who cares by whom it was deployed as long as it behaves according to the expected interface?
    @state(Field) deployer = State<Field>();
    @state(PublicKey) funder = State<PublicKey>();

    deploy(args: DeployArgs) {
        super.deploy(args);
        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
        });
    }

    @method claim() {
       // empty (for now) 
    }

    @method confirmUsage() {
        // empty
    }

}