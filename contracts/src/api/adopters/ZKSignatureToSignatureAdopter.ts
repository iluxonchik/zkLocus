import { Signature } from "o1js";
import { ZKLocusAdopter } from "./Interfaces";

export default function<T extends new (...args: any[]) => { raw: Signature | string; normalized: Signature; }>(Base: T) {
    return class extends Base implements ZKLocusAdopter<Signature | string, Signature, Signature> {
        rawValue(): Signature | string {
            return this.raw;
        }

        normalizedValue(): Signature {
            return this.normalized;
        }

        toZKValue(): Signature {
            // Direct conversion as the internal type is already a Signature
            return this.normalized;
        }
    };
}
