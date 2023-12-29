import { Field, Poseidon, Struct } from "o1js";
import { SHA3 } from 'sha3';

/**
 * Represents an SHA3-512 hash that is partitioned into three 128-bit slices in the form of Field elements.
 * This class is used to represent an SHA3-512 hash using Zero-Knowledge circuit compatible structures.
 */
export class PartionedSHA3_512 {
    protected _slice1: Field;
    protected _slice2: Field;
    protected _slice3: Field;

    constructor(protected readonly digestHex: string) { 
        const slices: [Field, Field, Field] = this.sliceHash(digestHex);
        this._slice1 = slices[0];
        this._slice2 = slices[1];
        this._slice3 = slices[2];
    }

    /**
     * Slices the given SHA3 hash into three fields.
     * 
     * @param hash - The SHA3 hash to slice.
     * @returns An array containing three fields.
     */
    protected sliceHash(digestHex: string): [Field, Field, Field] {
        const fieldElements: Field[] = this.convertHashToFields(digestHex);
        return [fieldElements[0], fieldElements[1], fieldElements[2]];
    }

    /**
     * Converts the hash output into an array of Field elements.
     * 
     * @param hashOutput The hash output as a string.
     * @returns An array of Field elements.
     */
    protected convertHashToFields(hashOutput: string): Field[] {
        // Split the 512-bit hash into three parts
        const partSizeHex = 128;  // Each part will be 128 hex characters (512 bits total for SHA3-512)
        let parts = [
            hashOutput.slice(0, partSizeHex),
            hashOutput.slice(partSizeHex, 2 * partSizeHex),
            hashOutput.slice(2 * partSizeHex)
        ];
        // Convert hex parts to Field elements
        return parts.map(part => {
            if (part === "") return new Field(0); // or handle as an error
            return new Field(BigInt('0x' + part));
        });
    }

    /**
     * Creates a PartionedSHA3_512 instance from three Field slices.
     * 
     * @param slice1 - The first Field slice.
     * @param slice2 - The second Field slice.
     * @param slice3 - The third Field slice.
     * @returns A new PartionedSHA3_512 instance.
     */
    static fromSlices2(slice1: Field, slice2: Field, slice3: Field): PartionedSHA3_512 {
        // Convert Field slices back to hex string
        const hashHex = slice1.toString() + slice2.toString() + slice3.toString();

        // Return a new PartionedSHA3_512 instance
        return new PartionedSHA3_512(hashHex);
    }

    // Corrected method
    static fromSlices(slice1: Field, slice2: Field, slice3: Field): PartionedSHA3_512 {
        // Convert fields back to their hexadecimal parts
        const slice1Hex = this.fieldToHex(slice1); // Implement fieldToHex accordingly
        const slice2Hex = this.fieldToHex(slice2); // Implement fieldToHex accordingly
        const slice3Hex = this.fieldToHex(slice3); // Implement fieldToHex accordingly

        // Combine slices back into a single hex string
        const combinedHex = slice1Hex + slice2Hex + slice3Hex;

        // Create a new PartionedSHA3_512 instance using the combined hex
        const hash = new SHA3<512>(512);  // Reinitialize SHA3 with the correct size
        hash.update(Buffer.from(combinedHex, 'hex'));  // Assume combinedHex is the correct hex representation of the original hash

        return new PartionedSHA3_512(combinedHex);
    }


    // Helper method to convert a Field element back to its hex representation
    static fieldToHex(field: Field): string {
        // Convert the field to BigInt and then to a hex string
        // Ensure that the hex string is correctly padded and formatted
        const bigint = field.toBigInt();  // Assuming Field has a toBigInt method
        return bigint.toString(16).padStart(128, '0');  // Padding to ensure correct length, adjust as necessary
    }

 
    get slice1(): Field {
        return this._slice1;
    }

    get slice2(): Field {
        return this._slice2;
    }

    get slice3(): Field {
        return this._slice3;
    }

}

/**
 * Represents an SHA3-512 hash that is partitioned into three 128-bit slices in the form of Field elements.
 * This class is used to represent an SHA3-512 hash using Zero-Knowledge circuit compatible structures.
 * It can be converted to a Poseidon.hash commitment by hasing the three slices together with Poseidon. 
 */
export class SHA3Sliced extends Struct({
    slice1: Field,
    slice2: Field,
    slice3: Field,
}) {

    private _cachedSHA3_512: PartionedSHA3_512 | null = null;

    /**
     * Converts the sliced SHA3 hash to a Poseidon hash.
     * @returns The Poseidon hash.
     */
    toPoseidon(): Field {
        return Poseidon.hash([this.slice1, this.slice2, this.slice3]);
    }

    /**
     * Computes the hash of the sliced SHA3 hash.
     * @returns The hash value.
     */
    hash(): Field {
        return this.toPoseidon();
    }

    /**
     * Returns a string representation of the sliced SHA3 hash.
     * @returns The string representation.
     */
    toString(): string {
        return `SHA3: ${this.hash.toString()}`;
    }
    
    /**
     * Converts the sliced SHA3 hash to a PartionedSHA3_512 hash.
     * If the hash is already cached, returns the cached value.
     * @returns The PartionedSHA3_512 hash.
     */
    toSHA3_512(): PartionedSHA3_512 {
        // Check if already cached
        if (!this._cachedSHA3_512) {
            this._cachedSHA3_512 = PartionedSHA3_512.fromSlices(this.slice1, this.slice2, this.slice3);
        }
        return this._cachedSHA3_512;
    }

    /**
     * Creates a sliced SHA3 hash from a string input.
     * @param input - The input string.
     * @returns The sliced SHA3 hash.
     */
    static fromString(input: string): SHA3Sliced {
        const hash = new SHA3(512);
        hash.update(input);
        const digestHex: string = hash.digest('hex');
        const partitionedHash = new PartionedSHA3_512(digestHex);

        return new SHA3Sliced(
            {
                slice1: partitionedHash.slice1,
                slice2: partitionedHash.slice2,
                slice3: partitionedHash.slice3
            }
        );
    }
}