
import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, Signature, UInt64 } from "o1js";
import { ZKLContract } from "../../../../blockchain/contracts/tokens/zkl/ZKLContract";
import { zkAppProver } from "o1js/dist/node/lib/account_update";


describe('ZKL Token Smart Contract', () => {
  const Local = Mina.LocalBlockchain();
  // let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
  let zkAppInstance: ZKLContract;
  const feePayer: PrivateKey = Local.testAccounts[0].privateKey;
  //const feePayer: PrivateKey = PrivateKey.fromBase58(PRIVATE_KEY)
  const feePayerPublicKey: PublicKey = feePayer.toPublicKey();
  const transactionFee: number = 100_000_000;
  const zkAppPrivateKey: PrivateKey = PrivateKey.random();
  const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();
  zkAppInstance = new ZKLContract(zkAppAddress);

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
    const verificationKey: {data: string, hash: Field} = (await ZKLContract.compile()).verificationKey;
    const endTimeSC = Date.now();
    console.log("Compilation complete!");
    console.log(`Smart contract compilation took ${endTimeSC - startTimeSC} milliseconds.`); 

    console.log("Deploying smart contract...");
    const txn = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
      AccountUpdate.fundNewAccount(feePayerPublicKey);
      zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey});
    });
    await txn.prove();
    txn.sign([feePayer, zkAppPrivateKey]);
    await txn.send();
    console.log("Smart contract deployed!");

    console.log(txn.toGraphqlQuery());
    console.log();
    console.log(txn.toJSON());
  });

  describe('Initial state checks', () => {
    it('Initial supply is zero', async () => {
        const totalSupply: UInt64 = zkAppInstance.circulatingSupply.get();
        expect(totalSupply.equals(UInt64.zero).toBoolean()).toBe(true);
    });
  }); 

});
