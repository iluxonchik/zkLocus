import { Account, AccountUpdate, Bool, DeployArgs, Field, PublicKey, SmartContract, State, VerificationKey, method, state, Permissions, Poseidon, Mina} from "o1js";
import { DeployeeSC } from "./DeployeeSC";

/**
 * Smart contract that verifies wether a smart contract at a particular address has been deployed by the sender of the transaction.
 * It's meant to be used as a part of the verifiable smart contract deployment checks.
 */
export class DeployerVerificationSC extends SmartContract {

    @state(Field) expectedVerificationKeyDigest = State<Field>();

    deploy(args: DeployArgs) {
        super.deploy(args);
        this.account.permissions.set({
            ...Permissions.default(),
        });

    }

    /**
     * Require the deployer of a smart contract to be the sender.
     * @param deployedSCAddr 
     * @param claimedDeployeeAddrDigest 
     */
    @method requireDeployedBySender(deployedSCAddr: PublicKey, claimedDeployeeAddrDigest: Field){

        // First, ensure the sender the claimed Deployee
        const senderDigest: Field = Poseidon.hash(this.sender.toFields());
        senderDigest.assertEquals(senderDigest);
        
        // Then, ensure the deployer attribute matches the sender/claimed
        const deployedSC: DeployeeSC = new DeployeeSC(deployedSCAddr);
        const supposedDeployerAddr: Field = deployedSC.deployer.get();
        deployedSC.deployer.requireEquals(supposedDeployerAddr);
        supposedDeployerAddr.assertEquals(claimedDeployeeAddrDigest);

        deployedSC.confirmUsage();
        
        // TODO:
        // Verify that the verification key of the SC is the expected one 
    }
}