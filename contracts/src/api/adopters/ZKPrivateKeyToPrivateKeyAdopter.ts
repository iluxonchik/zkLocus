import { PrivateKey } from "o1js"; // Adjust import paths as necessary
import { ZKLocusAdopter } from "./Interfaces"; // Adjust import paths as necessary

export default function<T extends new (...args: any[]) => { raw: PrivateKey | string; normalized: PrivateKey; }>(Base: T) {
    return class extends Base implements ZKLocusAdopter<PrivateKey | string, PrivateKey, PrivateKey> {
        rawValue(): PrivateKey | string {
            return this.raw;
        }

        normalizedValue(): PrivateKey {
            return this.normalized;
        }

        toZKValue(): PrivateKey {
            // Direct conversion as the internal type is already a PrivateKey
            return this.normalized;
        }
    };
}
