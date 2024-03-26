
import { AccountUpdate, Field, Mina, Poseidon, PrivateKey, PublicKey } from "o1js";
import { RandoMinaContract, RandomNumberObservationCircuit, RandomNumberObservationCircuitProof } from "../../../blockchain/contracts/RandoMinaContract";
import { NetworkValue } from "o1js/dist/node/lib/precondition";


describe('RandoMina Random Number Generator', () => {
  const Local = Mina.LocalBlockchain();
  // let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
  let zkAppInstance: RandoMinaContract;
  const feePayer: PrivateKey = Local.testAccounts[0].privateKey;
  //const feePayer: PrivateKey = PrivateKey.fromBase58(PRIVATE_KEY)
  const feePayerPublicKey: PublicKey = feePayer.toPublicKey();
  const transactionFee: number = 100_000_000;

  const feePayerPublicKeyDigest: Field = Poseidon.hash(feePayerPublicKey.toFields());

  beforeAll(async () => {
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
    const txn = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
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
  });

  describe('Success Case', () => {
    it('Generating a random number with a random Nonce succeeds', async () => {
      const randomNonce: Field = Field.random();
      const currNetworkState: NetworkValue = Mina.activeInstance.getNetworkState();
      const currentState: Field = currNetworkState.stakingEpochData.ledger.hash;
      const sender: Field = Poseidon.hash(feePayerPublicKey.toFields());

      console.log('Generating observation of computation of PRNG...');
      const randomNumberGenerationObservation: RandomNumberObservationCircuitProof = await RandomNumberObservationCircuit.generateRandomNumber(
        { networkState: currentState, sender: sender }, // public PRNG params
        randomNonce, // private PRNG param
      );
      console.log('Observation of computation of PRNG generated!');

      // Extract generated random number from proof. Verificaiton is skipped, because it
      // is perfomed in the smart contract call below
      const obtainedRandomNumber: Field = randomNumberGenerationObservation.publicOutput;
      // Re-construct PRNG algorithm
      const expectedRandomNumber: Field = Poseidon.hash([currentState, feePayerPublicKeyDigest, randomNonce]);

      const isPRNGCorrect: boolean = obtainedRandomNumber.equals(expectedRandomNumber).toBoolean()
      expect(isPRNGCorrect).toBe(true);

      console.log("Posting proof to blockchain...");
      const txn: Mina.Transaction = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
        zkAppInstance.verifyRandomNumber(randomNumberGenerationObservation);
      });

      console.log("\tProving smart contract invocation...");
      await txn.prove();
      console.log("\tSmart contract invocation proved!");

      txn.sign([feePayer]);

      // Assert that transaction was successful. A successful transaction means a valid random num
      const pendingTxn: Mina.PendingTransaction = await txn.send();
      expect(pendingTxn).toBeDefined();
      // TODO: update test for o1js 0.17
      //expect(pendingTxn.isSuccess).toBe(true);
    });

    it('Generating a random number with the same nonce', async () => {
      const randomNonce: Field = Field.random();
      const currNetworkState: NetworkValue = Mina.activeInstance.getNetworkState();
      const currentState: Field = currNetworkState.stakingEpochData.ledger.hash;
      const sender: Field = Poseidon.hash(feePayerPublicKey.toFields());

      console.log('Generating first observation of computation of PRNG...');
      const randomNumberGenerationObservation: RandomNumberObservationCircuitProof = await RandomNumberObservationCircuit.generateRandomNumber(
        { networkState: currentState, sender: sender }, // public PRNG params
        randomNonce, // private PRNG param
      );
      console.log('Observation of computation of PRNG generated!');

      // Extract generated random number from proof. Verificaiton is skipped, because it
      // is perfomed in the smart contract call below
      const obtainedRandomNumber1: Field = randomNumberGenerationObservation.publicOutput;
      // Re-construct PRNG algorithm
      const expectedRandomNumber1: Field = Poseidon.hash([currentState, feePayerPublicKeyDigest, randomNonce]);

      const isPRNGCorrect: boolean = obtainedRandomNumber1.equals(expectedRandomNumber1).toBoolean()
      expect(isPRNGCorrect).toBe(true);

      console.log("Creating first transaction..");
      const firstTxn: Mina.Transaction = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
        zkAppInstance.verifyRandomNumber(randomNumberGenerationObservation);
      });

      console.log("\tProving smart contract invocation...");
      await firstTxn.prove();
      console.log("\tSmart contract invocation proved!");

      firstTxn.sign([feePayer]);

      // Assert that transaction was successful. A successful transaction means a valid random num
      const firstTxnId: Mina.PendingTransaction = await firstTxn.send();
      expect(firstTxnId).toBeDefined();
      // TODO: update test for o1js 0.17 
      //expect(firstTxnId.isSuccess).toBe(true);

      // Now, let's repeat the same process with the same nonce and ensure that the generation functions as designed

      console.log('Generating second observation of computation of PRNG...');
      const randomNumberGenerationObservation2: RandomNumberObservationCircuitProof = await RandomNumberObservationCircuit.generateRandomNumber(
        { networkState: currentState, sender: sender }, // public PRNG params
        randomNonce, // private PRNG param
      );
      console.log('Observation of second computation of PRNG generated!');

      // Extract generated random number from proof. Verificaiton is skipped, because it
      // is perfomed in the smart contract call below
      const obtainedRandomNumber2: Field = randomNumberGenerationObservation2.publicOutput;
      expect(obtainedRandomNumber2.equals(obtainedRandomNumber1).toBoolean()).toBe(true);

      console.log("Creating second transaction..");
      const secondTxn: Mina.Transaction = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
        zkAppInstance.verifyRandomNumber(randomNumberGenerationObservation);
      });

      console.log("\tProving smart contract invocation...");
      await secondTxn.prove();
      console.log("\tSmart contract invocation proved!");

      secondTxn.sign([feePayer]);

      // Assert that transaction was successful. A successful transaction means a valid random num
      const secondTxnId: Mina.PendingTransaction = await secondTxn.send();
      expect(secondTxnId).toBeDefined();
      // TODO: update test for o1js 0.17
      //expect(secondTxnId.isSuccess).toBe(true);

    });

  });

  describe("Failure Case", () => {
    it('Generating a number with mismatched network state fails', async () => {
      const randomNonce: Field = Field.random();
      const currentState: Field = Field.random(); // Random network state
      const sender: Field = Poseidon.hash(feePayerPublicKey.toFields());

      const actualCurrNetworkState: NetworkValue = Mina.activeInstance.getNetworkState();
      const actualCurrentState: Field = actualCurrNetworkState.stakingEpochData.ledger.hash;

      // Sanity check to ensure that the randomly generated number is not equal to the actual network state
      const isAbortTest: boolean = actualCurrentState.equals(currentState).toBoolean();
      expect(isAbortTest).toBe(false);

      console.log('Generating observation of computation of PRNG...');
      const randomNumberGenerationObservation: RandomNumberObservationCircuitProof = await RandomNumberObservationCircuit.generateRandomNumber(
        { networkState: currentState, sender: sender }, // public PRNG params
        randomNonce, // private PRNG param
      );
      console.log('Observation of computation of PRNG generated!');

      // Extract generated random number from proof. Verificaiton is skipped, because it
      // is perfomed in the smart contract call below
      const obtainedRandomNumber: Field = randomNumberGenerationObservation.publicOutput;
      // Re-construct PRNG algorithm
      const expectedRandomNumber: Field = Poseidon.hash([currentState, feePayerPublicKeyDigest, randomNonce]);

      const isPRNGCorrect: boolean = obtainedRandomNumber.equals(expectedRandomNumber).toBoolean()
      expect(isPRNGCorrect).toBe(true);

      console.log("Posting proof to blockchain...");
      const txn: Mina.Transaction = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
        zkAppInstance.verifyRandomNumber(randomNumberGenerationObservation);
      });

      console.log("\tProving smart contract invocation...");
      await txn.prove();
      console.log("\tSmart contract invocation proved!");
      
      txn.sign([feePayer]);

      await expect(txn.send()).rejects.toThrow(/Protocol_state_precondition_unsatisfied/);
    });
  });

  it('Generating a number with mismatched public key fails', async () => {
    const randomNonce: Field = Field.random();
    const currNetworkState: NetworkValue = Mina.activeInstance.getNetworkState();
    const currentState: Field = currNetworkState.stakingEpochData.ledger.hash;
    const sender: Field = Field.random(); // Random sender
    const actualSender: Field = Poseidon.hash(feePayerPublicKey.toFields());

    // Ensure that the randomly generated sender is not equal to the actual sender
    const isAbortTest: boolean = actualSender.equals(sender).toBoolean();
    expect(isAbortTest).toBe(false);

    console.log('Generating observation of computation of PRNG...');
    const randomNumberGenerationObservation: RandomNumberObservationCircuitProof = await RandomNumberObservationCircuit.generateRandomNumber(
      { networkState: currentState, sender: sender }, // public PRNG params
      randomNonce, // private PRNG param
    );
    console.log('Observation of computation of PRNG generated!');

    // Extract generated random number from proof. Verificaiton is skipped, because it
    // is perfomed in the smart contract call below
    const obtainedRandomNumber: Field = randomNumberGenerationObservation.publicOutput;
    // Re-construct PRNG algorithm
    const expectedRandomNumber: Field = Poseidon.hash([currentState, sender, randomNonce]);

    const isPRNGCorrect: boolean = obtainedRandomNumber.equals(expectedRandomNumber).toBoolean()
    expect(isPRNGCorrect).toBe(true);

    console.log("Posting proof to blockchain...");
    await expect(Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
      zkAppInstance.verifyRandomNumber(randomNumberGenerationObservation);
    })).rejects.toThrow(/Field.assertEquals()/);
  });

  it('Generating a number with mismatched network state and public key fails', async () => {
    const randomNonce: Field = Field.random();

    const currentState: Field = Field.random(); // Random network state
    const actualCurrNetworkState: NetworkValue = Mina.activeInstance.getNetworkState();
    const actualCurrentState: Field = actualCurrNetworkState.stakingEpochData.ledger.hash;

    const sender: Field = Field.random(); // Random sender
    const actualSender: Field = Poseidon.hash(feePayerPublicKey.toFields());

    // Ensure that the randomly generated sender is not equal to the actual sender
    const isSenderMismatchAbort: boolean = actualSender.equals(sender).toBoolean();
    expect(isSenderMismatchAbort).toBe(false);

    // Sanity check to ensure that the randomly generated number is not equal to the actual network state
    const isNetworkStateAbort: boolean = actualCurrentState.equals(currentState).toBoolean();
    expect(isNetworkStateAbort).toBe(false);

    console.log('Generating observation of computation of PRNG...');
    const randomNumberGenerationObservation: RandomNumberObservationCircuitProof = await RandomNumberObservationCircuit.generateRandomNumber(
      { networkState: currentState, sender: sender }, // public PRNG params
      randomNonce, // private PRNG param
    );
    console.log('Observation of computation of PRNG generated!');

    // Extract generated random number from proof. Verificaiton is skipped, because it
    // is perfomed in the smart contract call below
    const obtainedRandomNumber: Field = randomNumberGenerationObservation.publicOutput;
    // Re-construct PRNG algorithm
    const expectedRandomNumber: Field = Poseidon.hash([currentState, sender, randomNonce]);

    const isPRNGCorrect: boolean = obtainedRandomNumber.equals(expectedRandomNumber).toBoolean()
    expect(isPRNGCorrect).toBe(true);

    console.log("Posting proof to blockchain...");
    const txn: Mina.Transaction = await Mina.transaction({ sender: feePayerPublicKey, fee: transactionFee }, () => {
      zkAppInstance.verifyRandomNumber(randomNumberGenerationObservation);
    });

    console.log("\tProving smart contract invocation...");
    await txn.prove();
    console.log("\tSmart contract invocation proved!");
    
    txn.sign([feePayer]);

    await expect(txn.send()).rejects.toThrow(/Protocol_state_precondition_unsatisfied/);
  });
});
