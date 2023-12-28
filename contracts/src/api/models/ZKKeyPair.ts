import { Field, Poseidon, PrivateKey, PublicKey } from "o1js";



export class ZKKeyPair<T extends PrivateKey | PublicKey> {
    protected key: T;

    hash(): Field {
        const keyAsFields: Field[] = this.key.toFields();
        return Poseidon.hash(keyAsFields);
    }

    toBase58(): string {
        return this.key.toBase58();
    }
}
