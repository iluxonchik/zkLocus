import { AccountUpdate, Bool, DeployArgs, Field, PublicKey, SmartContract, State, VerificationKey, method, state } from "o1js";
import { DeployeeSC } from "./DeployeeSC";

/**
 * DeployerSC is a smart contract that deploys another Smart Contract.
 */
export class DeployerSC extends SmartContract {
    @state(PublicKey) bountyMapRoot = State<PublicKey>();

    @method deployDeployee(deployeeAddr: PublicKey, verificationKey: VerificationKey) { 
        const deployeeSC: DeployeeSC = new DeployeeSC(deployeeAddr);
        deployeeSC.deploy({verificationKey: verificationKey});
        deployeeSC.initState(deployeeAddr);
        
        // Retrieve the account update of DeployeeSC
        const deployeeAccountUpdate: AccountUpdate = deployeeSC.self;

        // TODO: ensure that verification key is set to a specific value
        // [Code is needed here]

        deployeeAccountUpdate.body.update.appState.at(0)?.isSome.assertEquals(Bool(true));

        // Approve the account update of the DeployeeSC
        this.approve(deployeeAccountUpdate);
    }
}