import {
  method,
  DeployArgs,
  Permissions,
  PublicKey,
  Poseidon,
  AccountUpdate,
  SmartContract,
  VerificationKey,
  Mina,
} from 'o1js';



/**
 * Bounty Bulletin Board (BBB) is the smart contact with which the end-user interacts for the deployment,
 * founding and claiming of bounties. The smart contract operates on instances of Bounty that it
 * deploys itself. The bounty token is $ZKL directly, without the need to create a derivative token,
 * like $BBB/$ZKL_BBB, present in the previous MVP. BBB is desiged to work without requiring the
 * need for off-chain storage.
 */
export class BountyBulletinBoardSC extends SmartContract {

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
        ...Permissions.default(),
    });
}

/**
 * Mints a new bounty for the funder. The current design allows for the funder to be arbitrarily set, meaning that
 * ayone can create a bounty for anyone else.
 * 
 * @param funderAddr - The public key of the funder.
 * @param bountyPubKey - The public key of the bounty.
 * @param bountyVerificationKey - The verification key of the newly minted Bounty contract
 */
@method mintBounty(funderAddr: PublicKey, bountyPubKey: PublicKey,  bountyVerificationKey: VerificationKey) {         
    let zkApp: AccountUpdate = AccountUpdate.createSigned(bountyPubKey);

    zkApp.account.permissions.set({
        ...Permissions.default(),
        editState: Permissions.proofOrSignature(),
    });

    zkApp.account.verificationKey.set(bountyVerificationKey);

    // Set two values in the Bounty: the funder address and the bounty address
    AccountUpdate.setValue(zkApp.body.update.appState[0], Poseidon.hash(this.address.toFields())); // deployer
    AccountUpdate.setValue(zkApp.body.update.appState[1], Poseidon.hash(funderAddr.toFields())); // funder

    const feePayer: AccountUpdate = AccountUpdate.createSigned(this.sender);
    // since the deployment of the zkApp is done a child update of the account update created by this
    // contract's AccountUpdate, we are transferring the account creation fee from the sender to the contract,
    // so that this smart contract's AU can pay for the zkApp's deployment [?] --> can other addr be used?
    const feeReceiver: AccountUpdate = AccountUpdate.create(this.address);
    feePayer.send({to:feeReceiver, amount: Mina.getNetworkConstants().accountCreationFee})
}
}
