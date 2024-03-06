import {
  SmartContract,
  method,
  DeployArgs,
  Permissions,
  UInt64,
  PublicKey,
  MerkleWitness,
  state,
  Field,
  State,
  Poseidon,
  Provable,
  Group,
} from 'o1js';
import { ZKLContract } from '../tokens/zkl/ZKLContract';

/*
  Merkle Witness Mental Model Glossary:

  "Witness for the key" - a witness for the key/value pair in the Merkle Map. The witness contains all of the
  necessary intermediate node values in the tree up to the tree's root, in order to compute a root
  for the tree for any "value" for the "key".
*/


type GroupHash = {
  x: Field;
  y: {
      x0: Field;
      x1: Field;
  };
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
export class BountyBulletinBoardContract extends SmartContract {
  // Root of the Merkle Map containing the bounty funding information.
  @state(PublicKey) bountyMapRoot = State<PublicKey>();

  // @method initState(intialBountyMapRoot: Field) {
  //   this.bountyMapRoot.set(intialBountyMapRoot);
  // }
  
  
  @method fundBounty(
    funderAddress: PublicKey,
    bountyId: UInt64, // the size of the tree will be fixed, but a self-replication mechanism will be implemented
    zklAmountIncrement: UInt64,
    //funderSignature: Signature // checking whether this is required, and what will it contain
  ) {

    // 1. Derive the  a PublicKey, which will represent the address of the account 
    // which contains the bounty $ZKL amount
    
    // https://github.com/o1-labs/o1js/blob/0ec1c9da8c714298e6088ffa88178abb3961d200/src/lib/nullifier.ts#L64
    const newGroupHash: GroupHash = Poseidon.hashToGroup([...funderAddress.toFields(), ...bountyId.toFields()]);
    const group: Group  = new Group({x: newGroupHash.x, y: newGroupHash.y.x0});
    const bountyPublicKey: PublicKey = PublicKey.fromGroup(group);

    this.bountyMapRoot.set(bountyPublicKey);

    // Temporary log statements
    Provable.asProver(() => {
      Provable.log(bountyPublicKey.toFields());
      Provable.log(bountyPublicKey.toBase58())
    });
  }

  @method mintFromZKL(
    zklAddress: PublicKey,
    amount: UInt64,
  ) {
    const zklContract: ZKLContract = new ZKLContract(zklAddress);
    zklContract.sendTo(this.address, amount);

    // Mint custom token of the same amount
  }

  @method burnToZKL(
    amount: UInt64,
  ) {
    // Burn an amount of BBB_ZKL to ZKL

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