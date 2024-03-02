import {
    SmartContract,
    method,
    DeployArgs,
    Permissions,
    UInt64,
    PublicKey,
    Signature,
    MerkleWitness,
  } from 'o1js';
 
  /*
  * Merkle Tree witness with a depth of 5. This number is beint iterated upon.
  */
  class MerkleWitness5 extends MerkleWitness(5) {}
    
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
  export class BountyBulletinBoardContract extends SmartContract {
    
    @method fundBounty(
      funderAddress: PublicKey,
      bountyId: UInt64, // the size of the tree will be fixed, but a self-replication mechanism will be implemented
      zklAmount: UInt64,
      witness: MerkleWitness5, // path to (funderAddress, bountyId) in the merkle tree
      zkAmountBefore: UInt64, // the amount of $ZKL in the funder's account before the funding
      funderSignature: Signature // checking whether this is required, and what will it contain
    ) {
      // 1. Verify that current $ZKL amount in the funder's account is equal to zkAmountBefore
      // 2. Transfer the zklAmount from the sender's account to the contract's account
      // 3. Increment the amount by zklAmount
      // 4. Update the merkle tree root with zkAmountBefore + zklAmount
    }

    deploy(args: DeployArgs) {
      super.deploy(args);
      this.account.permissions.set({
        ...Permissions.default(),
        editState: Permissions.proofOrSignature(),
      });
    }

    @method init() {
        super.init();
    } 
}