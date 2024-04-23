import { DeployArgs, PublicKey, SmartContract, State, state , Permissions, method, Field} from "o1js";

export class DeployeeSC extends SmartContract {
    @state(Field) deployer = State<Field>();
    @state(PublicKey) bountyMapRoot = State<PublicKey>();

    deploy(args: DeployArgs) {
        super.deploy(args);
        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
        });
    }

    @method confirmUsage() {
        // Meant to be empty
    }

}