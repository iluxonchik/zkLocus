import { DeployArgs, PublicKey, SmartContract, State, state , Permissions, method, Field} from "o1js";

export class BountySC extends SmartContract {
    @state(Field) deployer = State<Field>();
    @state(Field) funder = State<Field>();

    deploy(args: DeployArgs) {
        super.deploy(args);
        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
        });
    }

    @method confirmUsage() {
        Field(0).assertEquals(Field(0));
    }

}