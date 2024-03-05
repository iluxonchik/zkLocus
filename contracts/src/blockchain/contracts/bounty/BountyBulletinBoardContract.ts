import {
    SmartContract,
    method,
    DeployArgs,
    Permissions,
    UInt64,
    PublicKey,
    Signature,
    MerkleWitness,
    state,
    Field,
    State,
    MerkleMapWitness,
    Poseidon,
    Scalar,
    PrivateKey,
    Provable,
  } from 'o1js';
 
  /*
  * Merkle Tree witness with a depth of 5. This number is beint iterated upon.
  */
  class MerkleWitness5 extends MerkleWitness(5) {}

  /*
    "Witness for the key" - a witness for the key/value pair in the Merkle Map. The witness contains all of the
    necessary intermediate node values in the tree up to the tree's root, in order to compute a root
    for the tree for any "value" for the "key".
  */
    
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
    // Root of the Merkle Map containing the bounty funding information.
    @state(PublicKey) bountyMapRoot = State<PublicKey>();

    // @method initState(intialBountyMapRoot: Field) {
    //   this.bountyMapRoot.set(intialBountyMapRoot);
    // }
    
    // //@method 
    // fundBounty(
    //   funderAddress: PublicKey,
    //   bountyId: UInt64, // the size of the tree will be fixed, but a self-replication mechanism will be implemented
    //   zklAmountIncrement: UInt64,
    //   keyWitness: MerkleMapWitness, // witness to the (funderAddress, bountyId) key in the Merkle Map
    //   zklAmountBefore: UInt64, // the amount of $ZKL in the funder's account before the funding
    //   //funderSignature: Signature // checking whether this is required, and what will it contain
    // ) {
    //   // 0. Verify Merkle Map root state
    //   const initialBountyMapRoot: Field = this.bountyMapRoot.get();
    //   this.bountyMapRoot.requireEquals(initialBountyMapRoot);

    //   // 1/2. Convert amounts data into Field
    //   const claimedZKLAmountBeforeField: Field = Poseidon.hash(zklAmountBefore.toFields());

    //   // 1. Verify that current $ZKL amount in the funder's account is equal to zkAmountBefore
    //   // 2. Transfer the zklAmount from the sender's account to the contract's account
    //   // 3. Increment the amount by zklAmount
      
    //   // Here, we will verify the witness and update the value for the key
    //   const actualKey: Field = Poseidon.hash([...funderAddress.toFields(), ...bountyId.toFields()]);

    //   const [claimedInitialBountyMapRoot, claimedKey] = keyWitness.computeRootAndKey(claimedZKLAmountBeforeField);
    //   claimedInitialBountyMapRoot.assertEquals(initialBountyMapRoot, "Claimed root is not the actual root");
    //   claimedKey.assertEquals(actualKey, "Claimed key is not the actual key");

    //   // Compute root after incremeneting the value
    //   const newZKLAmount: UInt64 = zklAmountBefore.add(zklAmountIncrement);
    //   const newZKLAmountField: Field = Poseidon.hash(newZKLAmount.toFields());

    //   const [newBountyMapRoot, _] = keyWitness.computeRootAndKey(newZKLAmountField);

    //   // 4. Update the Merkle Map root with zkAmountBefore + zklAmount
    //   this.bountyMapRoot.set(newBountyMapRoot);
    //}

        
    @method fundBounty2(
      funderAddress: PublicKey,
      bountyId: UInt64, // the size of the tree will be fixed, but a self-replication mechanism will be implemented
      zklAmountIncrement: UInt64,
      //funderSignature: Signature // checking whether this is required, and what will it contain
    ) {

      // 1. Derive the  a PublicKey, which will represent
      //     the address of the account which contains the bounty $ZKL amount
      
      const publicKeyFields: Field[] = funderAddress.toFields();
      const newFirstElement: Field = Poseidon.hash([...funderAddress.toFields(), ...bountyId.toFields()]);
      publicKeyFields[publicKeyFields.length - 1] = Poseidon.hash(bountyId.toFields());

      const bountyPublicKey: PublicKey = PublicKey.fromFields([newFirstElement, publicKeyFields[1]]);

      this.bountyMapRoot.set(bountyPublicKey);

      Provable.asProver(() => {
        Provable.log(bountyPublicKey.toFields());
        Provable.log(bountyPublicKey.toBase58())
      });
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