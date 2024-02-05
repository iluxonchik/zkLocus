
import { AccountUpdate, Field, Mina, Poseidon, PrivateKey, PublicKey } from "o1js";
import { RandoMinaContract, RandomNumberObservationCircuit, RandomNumberObservationCircuitProof } from "../../../blockchain/contracts/RandoMinaContract";
import { NetworkValue } from "o1js/dist/node/lib/precondition";

const isProofsEnabled: boolean = true;

describe('RandoMina Random Number Generator', () => {
  const Local = Mina.LocalBlockchain();
  // let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
  let zkAppInstance: RandoMinaContract;
  const feePayer: PrivateKey = Local.testAccounts[0].privateKey;
  //const feePayer: PrivateKey = PrivateKey.fromBase58(PRIVATE_KEY)
  const feePayerPublicKey: PublicKey = feePayer.toPublicKey();
  const transactionFee = 100_000_000;

  beforeAll(async () => {
    if (isProofsEnabled) {
      console.log("Compiling circuits...");
      const startTime = Date.now();
      await RandomNumberObservationCircuit.compile();
      const endTime = Date.now();
      console.log("Compilation complete!");
      console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);

      Mina.setActiveInstance(Local);
      //Mina.setActiveInstance(Berkeley);

      console.log("Compiling smart contract...");
      const startTimeSC = Date.now();
      await RandoMinaContract.compile();
      const endTimeSC = Date.now();
      console.log("Compilation complete!");
      console.log(`Smart contract compilation took ${endTimeSC - startTimeSC} milliseconds.`);


      const zkAppPrivateKey: PrivateKey = PrivateKey.random();
      const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();
      zkAppInstance = new RandoMinaContract(zkAppAddress);

      console.log("Deploying smart contract...");
      const txn = await Mina.transaction({sender: feePayerPublicKey, fee: transactionFee}, () => {
        AccountUpdate.fundNewAccount(feePayerPublicKey);
        zkAppInstance.deploy();
      });
      await txn.prove();
      txn.sign([feePayer, zkAppPrivateKey]);
      await txn.send();
      console.log("Smart contract deployed!");

      console.log(txn.toGraphqlQuery());
      console.log();
      console.log(txn.toJSON());
    }
  });

  describe('Success Case', () => {
    it('Generating a random number with a random Nonce succeeds', async () => {

      const randomNonce: Field = Field.random();
      const currNetworkState: NetworkValue = Mina.activeInstance.getNetworkState();
      const currentState: Field = currNetworkState.stakingEpochData.ledger.hash;

      console.log('Generating observation of computation of PRNG...');
      const randomNumberGenerationObservation: RandomNumberObservationCircuitProof = await RandomNumberObservationCircuit.generateRandomNumber({networkState: currentState, nonce: randomNonce}); 
      console.log('Observation of computation of PRNG generated!');

      console.log("Posting proof to blockchain...");
      const txn = await Mina.transaction({sender: feePayerPublicKey, fee: transactionFee}, () => {
        zkAppInstance.verifyRandomNumber(randomNumberGenerationObservation);
      });
      
      console.log("\tProving smart contract invocation...");
      await txn.prove();
      console.log("\tSmart contract invocation proved!");
      txn.sign([feePayer]);
      const txnId: Mina.TransactionId = await txn.send();

      expect(txnId).toBeDefined();
      expect(txnId.isSuccess).toBe(true);   
    });
  });
});