import {
  method,
  DeployArgs,
  Permissions,
  UInt64,
  PublicKey,
  state,
  Field,
  State,
  Poseidon,
  Provable,
  Group,
  AccountUpdate,
  TokenContract,
  AccountUpdateForest,
  Bool,
} from 'o1js';
import { ZKLContract } from '../tokens/zkl/ZKLContract';

/*
  Merkle Witness Mental Model Glossary:

  "Witness for the key" - a witness for the key/value pair in the Merkle Map. The witness contains all of the
  necessary intermediate node values in the tree up to the tree's root, in order to compute a root
  for the tree for any "value" for the "key".
*/


type GroupHash = {
  x: Field,
  y: { x0: Field },
}



/**
 * Bounty Bulletin Board is the smart contract that exposes the "Fund Bounty" and "Claim Bounty" interfaces.
 * 
 * In the "Fund Bounty" phase, a bounty with a particular ID is funded. In this process, the $ZKL amount
 * associated with the bounty represented by (funder_addres, bounty_id) is locked up in the contract.
 * 
 * In the "Claim Bounty" phase, a bounty with a particular ID is claimed. In this process, the the $ZKL amount
 * associated with the (funder_addres, bounty_id) key is transferred to the claimer_address.
 * 
 * This smart contract is an iterative development of the Bounty Bulletin Board standard, which will be materialized
 * in a set of hierarchical interfaces and implementaions.
 */
export class BountyBulletinBoardContract extends TokenContract {

  // @method initState(intialBountyMapRoot: Field) {
  //   this.bountyMapRoot.set(intialBountyMapRoot);
  // }

  @method async approveBase(forest: AccountUpdateForest) {
    //this.checkZeroBalanceChange(forest);
    forest.isEmpty().assertFalse();
  }

  async balanceOf(owner: PublicKey | AccountUpdate) {
    let update =
      owner instanceof PublicKey
        ? AccountUpdate.create(owner, this.deriveTokenId())
        : owner;
    this.approveAccountUpdate(update);
    return update.account.balance.getAndRequireEquals();
  }


  deriveBountyAccountAddress(
    funderAddress: PublicKey,
    bountyId: UInt64, // the size of the tree will be fixed, but a self-replication mechanism will be implemented
  ): PublicKey {

    // 1. Derive the  a PublicKey, which will represent the address of the account 
    // which contains the bounty $ZKL amount

    // https://github.com/o1-labs/o1js/blob/0ec1c9da8c714298e6088ffa88178abb3961d200/src/lib/nullifier.ts#L64
    const group: Group = Poseidon.hashToGroup([...funderAddress.toFields(), ...bountyId.toFields()]);
    const bountyPublicKey: PublicKey = PublicKey.fromGroup(group);

    return bountyPublicKey;
  }

  @method.returns(PublicKey)
  async deriveBountyAccountAddressMethod(
    funderAddress: PublicKey,
    bountyId: UInt64, // the size of the tree will be fixed, but a self-replication mechanism will be implemented
  ){

    // 1. Derive the  a PublicKey, which will represent the address of the account 
    // which contains the bounty $ZKL amount

    // https://github.com/o1-labs/o1js/blob/0ec1c9da8c714298e6088ffa88178abb3961d200/src/lib/nullifier.ts#L64
    const group: Group = Poseidon.hashToGroup([...funderAddress.toFields(), ...bountyId.toFields()]);
    const bountyPublicKey: PublicKey = PublicKey.fromGroup(group);

    return bountyPublicKey;
  }

  @method
  async sendFromTo(
    senderAddress: PublicKey,
    receiverAddress: PublicKey,
    amount: UInt64
  ) {

    // let accountUpdate = AccountUpdate.create(senderAddress, this.deriveTokenId());
    // accountUpdate.send({to: receiverAddress, amount: amount});
    // this.approveAccountUpdate(accountUpdate);
    let accountUpdate = this.internal.send({
      from: senderAddress,
      to: receiverAddress,
      amount: amount,
    });
    this.approveAccountUpdate(accountUpdate);
  }


// TODO: next step: implement the fund and the claim bounty methods using the "peove that I deployed constract X" approach
@method.returns(PublicKey)
async fundBounty(
    
    funderAddress: PublicKey,
    bountyId: UInt64, // TODO: for now, a single bounty ID is supported
    bbAmountIncrement: UInt64,
  ){

    // 1. Derive the  a PublicKey, which will represent the address of the account 
    // which contains the bounty $ZKL amount
    const bountyPublicKey: PublicKey = await this.deriveBountyAccountAddressMethod(funderAddress, bountyId);

    // NOTE: funding of new account may be required, if the "bountyPublicKey" is a new account.
    // The sender can easily verify wether the bounty needs to be funded (new bounty operation),
    // or whether it already exists

    const au: AccountUpdate = AccountUpdate.create(bountyPublicKey, this.deriveTokenId());
    au.body.update.permissions = {
      isSome: Bool(true),
      value: {
        ...Permissions.default(),
        send: Permissions.none(),
        receive: Permissions.none(),
      }
    }

    au.balance.addInPlace(bbAmountIncrement);

    this.approve(au);

    // this.internal.send(
    //   {
    //     from: this.sender,
    //     to: au,
    //     amount: bbAmountIncrement,
    //   }
    // )

    return bountyPublicKey;
  }


  @method.returns(PublicKey) async fundBountyOriginal(
    funderAddress: PublicKey,
    bountyId: UInt64, // the size of the tree will be fixed, but a self-replication mechanism will be implemented
    bbAmountIncrement: UInt64,
  ){

    // 1. Derive the  a PublicKey, which will represent the address of the account 
    // which contains the bounty $ZKL amount
    const bountyPublicKey: PublicKey = await this.deriveBountyAccountAddressMethod(funderAddress, bountyId);

    // NOTE: funding of new account may be required, if the "bountyPublicKey" is a new account.
    // The sender can easily verify wether the bounty needs to be funded (new bounty operation),
    // or whether it already exists
    this.internal.send(
      {
        from: this.sender.getAndRequireSignature(),
        to: bountyPublicKey,
        amount: bbAmountIncrement,
      }
    )

    return bountyPublicKey;

    // Temporary log statements
    Provable.asProver(() => {
      Provable.log(bountyPublicKey.toFields());
      Provable.log(bountyPublicKey.toBase58())
    });
  }

  @method async claimBounty(
    funderAddress: PublicKey,
    bountyId: UInt64,
  ) {
    // 1. Derive the  a PublicKey, which will represent the address of the account 
    // which contains the bounty $ZKL amount
    const bountyPublicKey: PublicKey = await this.deriveBountyAccountAddressMethod(funderAddress, bountyId);

    // // sender acccount update 
    let au = AccountUpdate.create(bountyPublicKey, this.deriveTokenId());
    let balance: UInt64 = au.account.balance.getAndRequireEquals();
    // au.balance.subInPlace(balance);
    // au.body.mayUseToken = AccountUpdate.MayUseToken.ParentsOwnToken;
    // this.approve(au);

    // // receiver account update
    // let au2 = AccountUpdate.create(this.sender, this.deriveTokenId());
    // au2.balance.addInPlace(balance);
    // au2.body.mayUseToken = AccountUpdate.MayUseToken.ParentsOwnToken;
    // this.approve(au2);


    //this.sendFromTo(bountyPublicKey, this.sender, balance);

    let ac = this.internal.send({
      from: bountyPublicKey,
      to: this.sender.getAndRequireSignature(),
      amount: balance,
    });


    //this.approveAccountUpdate(au);

    //this.burnToZKL(bountyPublicKey, this.sender);
  }

  @method async approveUpdate(au: AccountUpdate) {
    this.approve(au);
  }

  @method async claimBountyWithApprove(
    claimAU: AccountUpdate,
    bountyId: UInt64,
  ) {
    this.approve(claimAU);


  }

  @method async mintFromZKL(
    zklAddress: PublicKey,
    amount: UInt64,
  ) {
    const zklContract: ZKLContract = new ZKLContract(zklAddress);
    zklContract.sendFromTo(this.sender.getAndRequireSignature(), this.address, amount);
    // Mint custom token of the same amount
    this.internal.mint({ address: this.sender.getAndRequireSignature(), amount: amount });
  }

  @method async burnToZKL(
    bountyAccountPublicKey: PublicKey,
    receiverAccountAddress: PublicKey,
  ) {

    // const bountyAccountUpdate = AccountUpdate.create(
    //   bountyAccountPublicKey,
    //   this.tokenId,
    // );

    // const bountyAmount: UInt64 = bountyAccountUpdate.account.balance.getAndRequireEquals();

    // this.token.send({
    //   from: bountyAccountPublicKey,
    //   to: this.address,
    //   amount: bountyAmount,
    // });

    // Burn an amount of BBB_ZKL to ZKL
    let accountUpdate = AccountUpdate.create(receiverAccountAddress, this.deriveTokenId());
    let currentBalance: UInt64 = accountUpdate.account.balance.getAndRequireEquals();
    accountUpdate.balance.subInPlace(currentBalance);
    accountUpdate.balanceChange
    let sendAccUpd = this.internal.send({ from: bountyAccountPublicKey, to: this.address, amount: currentBalance });
    //this.approveAccountUpdate(sendAccUpd);
    //this.internal.burn({address: this.address, amount: currentBalance});
    const zklContract: ZKLContract = new ZKLContract(receiverAccountAddress);
    //zklContract.sendFromTo(this.address, receiverAccountAddress, bountyAmount);
  }

  async deploy(args: DeployArgs) {
    super.deploy(args);
    // Temporarily all set to proof, will be refined later
    this.account.permissions.set({
      ...Permissions.default(),
      //editState: Permissions.proof(),
      setTokenSymbol: Permissions.proof(),
      send: Permissions.proof(),
      //receive: Permissions.none()
      //access: Permissions.proofOrSignature(),
    });

  }

  @method async init() {
    super.init();
    this.account.tokenSymbol.set("BBB");
  }
}