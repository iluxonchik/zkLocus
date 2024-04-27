import { DeployArgs, SmartContract, State, state , Permissions, method, Field, PublicKey, AccountUpdate, UInt64} from "o1js";
import { ZKLContract } from "../tokens/zkl/ZKLContract";

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

    @method claim(zklTokenAddr: PublicKey) {
        // ensure that the sender is the claimed one, by requiring a signature
        const claimer: PublicKey = this.sender; 
        const ac: AccountUpdate = AccountUpdate.createSigned(claimer);
        this.approve(ac);

        const zklTokenSC: ZKLContract = new ZKLContract(zklTokenAddr);
        let au = AccountUpdate.create(this.address, zklTokenSC.tokenId);
        let balance: UInt64 = au.account.balance.getAndRequireEquals();

        zklTokenSC.sendFromTo(this.address, claimer, balance);
    }

    @method confirmUsage() {
        Field(0).assertEquals(Field(0));
    }

}