import { Field, Poseidon, PrivateKey, PublicKey } from "o1js";



/**
 * Represents a key pair used in zero-knowledge proofs.
 * @template T - The type of the key (PrivateKey or PublicKey).
 */
export class ZKKeyPair<T extends PrivateKey | PublicKey> {
    protected key: T;

    /**
     * Computes the hash of the key using the Poseidon hash function.
     * @returns The hash value as a Field object.
     */
    hash(): Field {
        const keyAsFields: Field[] = this.key.toFields();
        return Poseidon.hash(keyAsFields);
    }

    /**
     * Converts the key to a Base58-encoded string.
     * @returns The key as a Base58-encoded string.
     */
    toBase58(): string {
        return this.key.toBase58();
    }
}
