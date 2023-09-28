import { zkLocusDataStore } from './zkLocusDataStore.js';

export { zkLocusDataStore };

import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'o1js';

console.log('o1js loaded');
const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

// the zkApp that will be deployed
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// deploy zkApp to MINA blockchain
const zkAppInstance: zkLocusDataStore = new zkLocusDataStore(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});

// transaction signed by both, the zkApp and the deployer of the zkApp
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// get initial state of zkApp
const num0 = zkAppInstance.num.get();
console.log('state after init:', num0.toString());

const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.incrementBy(Field(64));
});
// create a zero-knowledge proof of the transaction that calls the update method and changes the state to new values
await txn1.prove();
// sign the proof, attesting that it came from a particular source and no one else
await txn1.sign([senderKey]).send();

const num1 = zkAppInstance.num.get();
console.log('state after txt1, with update() called:', num1.toString());

console.log('Shutting down');
await shutdown();
