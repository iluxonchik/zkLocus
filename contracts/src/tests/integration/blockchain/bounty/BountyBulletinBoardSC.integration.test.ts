
import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, Signature, UInt64 } from "o1js";
import { BountyBulletinBoardContract } from "../../../../blockchain/contracts/bounty/BountyBulletinBoardContract";



describe('ZKL Token Smart Contract', async () => {
  const Local = await Mina.LocalBlockchain();
  // let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
  let zkAppInstance: BountyBulletinBoardContract;
  const feePayer: PrivateKey = Local.testAccounts[0].key;
  //const feePayer: PrivateKey = PrivateKey.fromBase58(PRIVATE_KEY)
  const feePayerPublicKey: PublicKey = feePayer.toPublicKey();
  const transactionFee: number = 100_000_000;
  const zkAppPrivateKey: PrivateKey = PrivateKey.random();
  const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();
  zkAppInstance = new BountyBulletinBoardContract(zkAppAddress);

  beforeAll(async () => {
    console.log("Compiling circuits...");
    const startTime = Date.now();
    // Empty here for now
    const endTime = Date.now();
    console.log("Compilation complete!");
    console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);

    Mina.setActiveInstance(Local);
    //Mina.setActiveInstance(Berkeley);

    console.log("Compiling smart contract...");
    const startTimeSC = Date.now();
    const verificationKey: { data: string, hash: Field } = (await BountyBulletinBoardContract.compile()).verificationKey;
    const endTimeSC = Date.now();
    console.log("Compilation complete!");
    console.log(`Smart contract compilation took ${endTimeSC - startTimeSC} milliseconds.`);

    console.log("Deploying smart contract...");
    const txn = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, async () => {
      AccountUpdate.fundNewAccount(feePayerPublicKey);
      await zkAppInstance.deploy({ verificationKey });
    });
    await txn.prove();
    txn.sign([feePayer, zkAppPrivateKey])
    await txn.send();
    console.log("Smart contract deployed!");

    console.log(txn.toGraphqlQuery());
    console.log();
    console.log(txn.toJSON());
  });

  describe('Funding Checks', () => {
    it('Funding a $ZKL bounty suceeds', async () => {
      const fundTx = await Mina.transaction(
        feePayer.toPublicKey(), async () => {
          //AccountUpdate.fundNewAccount(feePayer.toPublicKey());
          await zkAppInstance.fundBounty(feePayer.toPublicKey(), UInt64.from(1), UInt64.from(1));
        });

      console.log("Proving fund transaction...")
      await fundTx.prove();
      await fundTx.sign([feePayer]).send();
      console.log("Mint transaction proved!");      
    });

  });

});
