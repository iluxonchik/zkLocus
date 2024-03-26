import { Bytes, Field, Hash, Poseidon} from "o1js";
import { ProvablePureExtended } from "o1js/dist/node/lib/circuit-value";


/**
 * Represents a 64-byte array.
 */
export class Bytes64 extends Bytes(64) { }


/**
 * Represents an SHA3-512 hash fully compatible with Zero-Knowledge circuits.
 */
export class SHA3_512 {

    protected _preimageBytes: Bytes64;
    protected _digest: Bytes64; 

    /**
     * Creates a new instance of SHA3_512.
     * @param _preimage The preimage string to be hashed.
     */
    constructor(protected readonly _preimage: string) {
        this._preimageBytes = Bytes.fromString(_preimage);
        this._digest = Hash.SHA3_512.hash(this._preimageBytes);
    }

    /**
     * Gets the provable type that can be used in Zero-Knowledge circuits.
     * @returns The provable type
     */
    static get provable(): ProvablePureExtended<Bytes, {
        bytes: {
            value: string;
        }[];
    }> {
        return Bytes64.provable;
    }

    /**
     * Gets the `Bytes64` representation of the preimage.
     * @returns The `Bytes64` representation of the preimage.
     */
    get preimageBytes(): Bytes64 {
        return this._preimageBytes;
    }

    /**
     * Gets the `Bytes64` representation of the digest.
     * @returns The `Bytes64` representation of the digest.
     */
    get digest(): Bytes64 {
        return this._digest;
    }

    /**
     * Gets raw preimage string. This is the string that was used to create the SHA3_512 instance.
     * @returns The raw preimage string.
     */
    get preimage(): string {
        return this._preimage;
    }

    /**
     * Returns the Poseidon.hash() of the SHA3-512 digest of the preimage. This is the commitment used
     * in the Zero-Knowledge circuits of zkLocus. 
     * @returns The Poseidon.hash() of the SHA3-512 digest of the preimage.
     */
    poseidonHash(): Field {
        return Poseidon.hash(this._digest.toFields());
    }
}
