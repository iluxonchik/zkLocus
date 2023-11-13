import { MyContract } from './Recursion.js';
import { SimpleStateUpdate } from './SimpleStateUpdate.js';
export { SimpleStateUpdate };
import { Field, Mina, PrivateKey, AccountUpdate, } from 'o1js';
console.log('o1js loaded');
const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];
// the zkApp that will be deployed
const myContractPrivateKey = PrivateKey.random();
const myContractAddress = myContractPrivateKey.toPublicKey();
const RecursiveFieldsPrivateKey = PrivateKey.random();
const RecursiveFieldsAddress = RecursiveFieldsPrivateKey.toPublicKey();
// deploy zkApp to MINA blockchain
const myContract = new MyContract(myContractAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    myContract.deploy();
});
// transaction signed by both, the zkApp and the deployer of the zkApp
await deployTxn.sign([deployerKey, myContractPrivateKey]).send();
// Pass the list of Field values to MyContract
const txn = await Mina.transaction(senderAccount, () => {
    myContract.processFields([Field(1), Field(2), Field(3)]);
});
await txn.prove();
await txn.sign([senderKey]).send();
// Print the sum of the Field values
const sum = myContract.sum.get();
console.log('Sum:', sum.toString());
console.log('Shutting down');
//# sourceMappingURL=index_recursion.js.map