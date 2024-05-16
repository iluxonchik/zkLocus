import { AccountUpdate, Field, Mina, Poseidon, PrivateKey, PublicKey, TransactionPromise, UInt64 } from "o1js";
import { ZKLContract } from "../../../../blockchain/contracts/tokens/zkl/ZKLContract";
import { BountyBulletinBoardSC } from "../../../../blockchain/contracts/bounty/BountyBulletinBoardSC";
import { BountySC } from "../../../../blockchain/contracts/bounty/BountySC";

describe('Bounty Bulletin Board Integration', async () => {
  const Local = await Mina.LocalBlockchain();
  Local.setProofsEnabled(false);
  Mina.setActiveInstance(Local);
  let zklSC: ZKLContract;
  const deployerPrivateKey: PrivateKey = Local.testAccounts[0].key;
  const deployerPublicKey: PublicKey = deployerPrivateKey.toPublicKey();

  const funderPrivateKey: PrivateKey = Local.testAccounts[1].key;
  const funderPublicKey: PublicKey = funderPrivateKey.toPublicKey();

  const claimerPrivateKey: PrivateKey = Local.testAccounts[2].key;
  const claimerPublicKey: PublicKey = claimerPrivateKey.toPublicKey();

  const transactionFee: number = 100_000_000;

  const zklAppPrivateKey: PrivateKey = PrivateKey.random();
  const zklAppAddress: PublicKey = zklAppPrivateKey.toPublicKey();

  const bbbAppPrivateKey: PrivateKey = PrivateKey.random();
  const bbbAppAddress: PublicKey = bbbAppPrivateKey.toPublicKey();

  zklSC = new ZKLContract(zklAppAddress);
  const bbbSC: BountyBulletinBoardSC = new BountyBulletinBoardSC(bbbAppAddress);

  beforeAll(async () => {
    console.log("Compiling smart contracts...");
    const startTimeSC = Date.now();
    const zklContractVerificationKey: { data: string, hash: Field } = (await ZKLContract.compile()).verificationKey;
    const bbbContractVerificationKey: { data: string, hash: Field } = (await BountyBulletinBoardSC.compile()).verificationKey;
    const bountyContractVerificationKey: { data: string, hash: Field } = (await BountySC.compile()).verificationKey;
    const endTimeSC = Date.now();
    console.log("Compilation complete!");
    console.log(`Smart contract compilation took ${endTimeSC - startTimeSC} milliseconds.`);

    console.log("Deploying $ZKL smart contract...");
    const txn1 = await Mina.transaction({ sender: deployerPublicKey, fee: transactionFee }, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey);
      await zklSC.deploy({ verificationKey: zklContractVerificationKey});
    });
    await txn1.prove();
    txn1.sign([deployerPrivateKey, zklAppPrivateKey]);
    await txn1.send();
    console.log("$ZKL smart contract deployed!");

    console.log("Deploying $BBB smart contract...");
    const txn2 = await Mina.transaction({ sender: deployerPublicKey, fee: transactionFee }, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey);
      await bbbSC.deploy({ verificationKey: bbbContractVerificationKey});
    });
    await txn2.prove();
    txn2.sign([deployerPrivateKey, bbbAppPrivateKey]);
    await txn2.send();
    console.log("$BBB smart contract deployed!");
  });

  it('Minting a bounty works as expected', async () => {
    const bountyPubKey: PublicKey = PrivateKey.random().toPublicKey();
    const bountyVerificationKey: { data: string, hash: Field } = (await BountySC.compile()).verificationKey;

    const mintBountyTxn = await Mina.transaction(deployerPublicKey, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey, 1);
      await bbbSC.mintBounty(funderPublicKey, bountyPubKey, bountyVerificationKey);
    });

    console.log("Proving mintBounty() transaction...");
    await mintBountyTxn.prove();
    await mintBountyTxn.sign([deployerPrivateKey]).send();
    console.log("mintBounty() transaction proved and sent to network!");

    const bountySC: BountySC = new BountySC(bountyPubKey);
    const bountyFunderAddrHash: Field = bountySC.funder.get();
    const expectedFunderAddrHash: Field = Poseidon.hash(funderPublicKey.toFields());
    expect(bountyFunderAddrHash).toEqual(expectedFunderAddrHash);
  });

  it('Funding a bounty works as expected', async () => {
    const bountyPubKey: PublicKey = PrivateKey.random().toPublicKey();
    const bountyVerificationKey: { data: string, hash: Field } = (await BountySC.compile()).verificationKey;

    const mintBountyTxn = await Mina.transaction(deployerPublicKey, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey, 1);
      await bbbSC.mintBounty(funderPublicKey, bountyPubKey, bountyVerificationKey);
    });

    console.log("Proving mintBounty() transaction...");
    await mintBountyTxn.prove();
    await mintBountyTxn.sign([deployerPrivateKey]).send();
    console.log("mintBounty() transaction proved and sent to network!");

    const mintZKLAmount: UInt64 = UInt64.from(1000);
    const mintZKLTxn = await Mina.transaction(funderPublicKey, async () => {
      AccountUpdate.fundNewAccount(funderPublicKey);
      await zklSC.mint(funderPublicKey, mintZKLAmount);
    });

    console.log(`Proving mint of ${mintZKLAmount} of $ZKL to ${funderPublicKey.toBase58()}...`);
    await mintZKLTxn.prove();
    await mintZKLTxn.sign([funderPrivateKey]).send();
    console.log(`Mint of ${mintZKLAmount} of $ZKL proved!`);

    const fundBountyAmount: UInt64 = UInt64.from(500);
    const fundBountyTxn  = await Mina.transaction(funderPublicKey, async () => {
      AccountUpdate.fundNewAccount(funderPublicKey, 1);
      await bbbSC.fundBounty(zklAppAddress, bountyPubKey, funderPublicKey, fundBountyAmount);
    });

    console.log("Proving fundBounty() transaction...");
    await fundBountyTxn.prove();
    await fundBountyTxn.sign([funderPrivateKey]).send();
    console.log("fundBounty() transaction proved and sent to network!");

    const bountyZKLBalance: bigint = Mina.getBalance(bountyPubKey, zklSC.deriveTokenId()).value.toBigInt();
    expect(bountyZKLBalance).toEqual(fundBountyAmount.toBigInt());
  });

  it('Claiming a bounty works as expected', async () => {
    const bountyPubKey: PublicKey = PrivateKey.random().toPublicKey();
    const bountyVerificationKey: { data: string, hash: Field } = (await BountySC.compile()).verificationKey;

    const mintBountyTxn = await Mina.transaction(deployerPublicKey, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey, 1);
      await bbbSC.mintBounty(funderPublicKey, bountyPubKey, bountyVerificationKey);
    });

    console.log("Proving mintBounty() transaction...");
    await mintBountyTxn.prove();
    await mintBountyTxn.sign([deployerPrivateKey]).send();
    console.log("mintBounty() transaction proved and sent to network!");

    const mintZKLAmount: UInt64 = UInt64.from(1000);
    const mintZKLTxn  = await Mina.transaction(funderPublicKey, async () => {
      AccountUpdate.fundNewAccount(funderPublicKey);
      await zklSC.mint(funderPublicKey, mintZKLAmount);
    });

    console.log(`Proving mint of ${mintZKLAmount} of $ZKL to ${funderPublicKey.toBase58()}...`);
    await mintZKLTxn.prove();
    await mintZKLTxn.sign([funderPrivateKey]).send();
    console.log(`Mint of ${mintZKLAmount} of $ZKL proved!`);

    const fundBountyAmount: UInt64 = UInt64.from(500);
    const fundBountyTxn = await Mina.transaction(funderPublicKey, async () => {
      AccountUpdate.fundNewAccount(funderPublicKey, 1);
      await bbbSC.fundBounty(zklAppAddress, bountyPubKey, funderPublicKey, fundBountyAmount);
    });

    console.log("Proving fundBounty() transaction...");
    await fundBountyTxn.prove();
    await fundBountyTxn.sign([funderPrivateKey]).send();
    console.log("fundBounty() transaction proved and sent to network!");

    const claimBountyTxn = await Mina.transaction(claimerPublicKey, async () => {
      AccountUpdate.fundNewAccount(claimerPublicKey, 1);
      await bbbSC.claimBounty(bountyPubKey, funderPublicKey, zklAppAddress);
    });

    console.log("Proving claimBounty() transaction...");
    await claimBountyTxn.prove();
    await claimBountyTxn.sign([claimerPrivateKey]).send();
    console.log("claimBounty() transaction proved and sent to network!");

    const bountyZKLBalance: bigint = Mina.getBalance(bountyPubKey, zklSC.deriveTokenId()).value.toBigInt();
    expect(bountyZKLBalance).toEqual(0n);

    const claimerZKLBalance: bigint = Mina.getBalance(claimerPublicKey, zklSC.deriveTokenId()).value.toBigInt();
    expect(claimerZKLBalance).toEqual(fundBountyAmount.toBigInt());
  });

});