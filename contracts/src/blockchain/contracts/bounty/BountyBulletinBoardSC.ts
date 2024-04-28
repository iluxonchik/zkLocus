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
  Field,
  UInt64,
} from 'o1js';
import { BountySC } from './BountySC';
import { ZKLContract } from '../tokens/zkl/ZKLContract';

class Constants {
  static ACCOUNT_CREATION_FEE: UInt64 = Mina.getNetworkConstants().accountCreationFee;
}

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
  @method mintBounty(funderAddr: PublicKey, bountyPubKey: PublicKey, bountyVerificationKey: VerificationKey) {
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
    feePayer.send({ to: feeReceiver, amount: Constants.ACCOUNT_CREATION_FEE })
  }

  /**
   * Funds a bounty by transferring the specified amount of tokens from the funder's address to the bounty's address.
   * 
   * @param zklAddr - The address of the ZKL contract.
   * @param bountyAddr - The address of the bounty contract.
   * @param funderAddr - The address of the funder.
   * @param amount - The amount of tokens to fund the bounty with.
   */
  @method fundBounty(zklAddr: PublicKey, bountyAddr: PublicKey, funderAddr: PublicKey, amount: UInt64) {
    this.requireBountyInterfaceConformance(bountyAddr, funderAddr);

    // TODO: put ZKLContract as const
    const zklContract: ZKLContract = new ZKLContract(zklAddr);
    zklContract.sendFromTo(
      this.sender, // asserting the sender is not important: anyone can fund the bounty
      bountyAddr,
      amount,
    )
  }

  /**
   * Ensures that a given bounty contract conforms to the required interface and attributes.
   * The deployer and founder attributes of the bounty must match the ones provided in the
   * private inputs (method args).
   *
   * @param {PublicKey} bountyAddr - The public key address of the bounty contract.
   * @param {PublicKey} funderAddr - The public key address of the funder of the bounty.
   *
   * @see {@link BountySC} for the bounty contract that this method checks.
   */
  @method requireBountyInterfaceConformance(bountyAddr: PublicKey, funderAddr: PublicKey) {

    const funderAddrHash: Field = Poseidon.hash(funderAddr.toFields());
    const thisAddrHash: Field = Poseidon.hash(this.address.toFields());


    // Ensure interface and attrs match
    // TODO: isn't just requiring interface conformance enough?
    const bountySC: BountySC = new BountySC(bountyAddr);

    const bountyDeployerAddrHash: Field = bountySC.deployer.get();
    bountySC.deployer.requireEquals(bountyDeployerAddrHash);
    bountyDeployerAddrHash.assertEquals(thisAddrHash);

    const bountyFunderAddrHash: Field = bountySC.funder.get();
    bountySC.funder.requireEquals(bountyFunderAddrHash);
    bountyFunderAddrHash.assertEquals(funderAddrHash);

    bountySC.confirmUsage();
  }

  @method claimBounty(bountyAddr: PublicKey, funderAddr: PublicKey, zklAddr: PublicKey) {
    // TODO: set zklAddr to constant, like this now to ease testing and dev
    this.requireBountyInterfaceConformance(bountyAddr, funderAddr);

    const bountySC: BountySC = new BountySC(bountyAddr);
    bountySC.claim(zklAddr);
  }
}
