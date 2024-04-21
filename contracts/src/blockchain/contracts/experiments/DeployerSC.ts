import { Account, AccountUpdate, Bool, DeployArgs, Field, PublicKey, SmartContract, State, VerificationKey, method, state, Permissions, Poseidon, Mina} from "o1js";
import { DeployeeSC } from "./DeployeeSC";

/**
 * DeployerSC is a smart contract that deploys another Smart Contract.
 */
export class DeployerSC extends SmartContract {
     
    @state(PublicKey) bountyMapRoot = State<PublicKey>();

    deploy(args: DeployArgs) {
        super.deploy(args);
        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.none(),
            incrementNonce: Permissions.none(),
        });
    }

    @method deployDeployee(deployeeAddr: PublicKey, deployeePubKey: PublicKey,  verificationKey: VerificationKey) {         
        deployeeAddr.assertEquals(this.sender);

        let zkApp: AccountUpdate = AccountUpdate.createSigned(deployeePubKey);

        zkApp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
        });

        zkApp.account.verificationKey.set(verificationKey);
        AccountUpdate.setValue(zkApp.body.update.appState[0], Poseidon.hash(deployeeAddr.toFields()));

        const feePayer: AccountUpdate = AccountUpdate.createSigned(deployeeAddr);
        const feeReceiver: AccountUpdate = AccountUpdate.create(this.address);
        feePayer.send({to:feeReceiver, amount: Mina.getNetworkConstants().accountCreationFee})
    }
}