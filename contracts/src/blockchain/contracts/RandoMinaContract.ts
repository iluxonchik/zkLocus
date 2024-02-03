import { Field, Poseidon, SmartContract, method } from "o1js";

export class RandomMina extends SmartContract {
    
    @method generateRandomNumber(minaState: Field, nonce: Field) {
        this.network.snarkedLedgerHash.requireEquals(minaState);

        return Poseidon.hash([minaState, nonce]);
    }
}