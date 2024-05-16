import { DeployArgs, SmartContract, State, state, Permissions, method, Field, PublicKey, AccountUpdate, UInt64 } from "o1js";
import { ZKLContract } from "../tokens/zkl/ZKLContract";

export class BountySC extends SmartContract {
    @state(Field) deployer = State<Field>();
    @state(Field) funder = State<Field>();

    async deploy(args: DeployArgs) {
        super.deploy(args);
        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
        });
    }

    /**
     * Claims the bounty by transferring the ZKL tokens to the claimer's address.
     * 
     * @param zklTokenAddr - The address of the ZKL token contract.
     */
    @method async claim(zklTokenAddr: PublicKey) {
        // ensure that the sender is the claimed one, by requiring a signature
        const claimer: PublicKey = this.sender.getAndRequireSignature();
        const ac: AccountUpdate = AccountUpdate.createSigned(claimer);
        this.approve(ac);

        const zklTokenSC: ZKLContract = new ZKLContract(zklTokenAddr);
        let au = AccountUpdate.create(this.address, zklTokenSC.tokenId);
        let balance: UInt64 = au.account.balance.getAndRequireEquals();

        zklTokenSC.sendFromTo(this.address, claimer, balance);
    }

    /**
     * Asserts that the verification key of the smart contract is the expected one. 
     * This is done by calling an empty method on the smart contract. 
     * Method call = Account Update with proof of authorization.
     */
    @method async assertVerificationKeyIsCorrect() {
        // must remain empty. no need for assertions or state changes
    }

}