import { PublicKey } from "o1js"; // Adjust import paths as necessary
import { ZKLocusAdopter } from "./Interfaces";

export default function<T extends new (...args: any[]) => { raw: PublicKey | string; normalized: PublicKey; }>(Base: T) {
    return class extends Base implements ZKLocusAdopter<PublicKey | string, PublicKey, PublicKey> {
        rawValue(): PublicKey | string {
            return this.raw;
        }

        normalizedValue(): PublicKey {
            return this.normalized;
        }

        toZKValue(): PublicKey {
            // Direct conversion as the internal type is already a PublicKey
            return this.normalized;
        }
    };
}

