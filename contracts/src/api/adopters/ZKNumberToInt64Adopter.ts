import { Int64 } from "o1js";
import { InputNumber } from "../Types";
import { ZKLocusAdopter } from "./Interfaces";

/**
 * Adaptor from ZKNumber to a zero-knowledge number used directly by zkLocus (Field).
 * @template T - The base class constructor.
 */
export default function<T extends new (...args: any[]) => { raw: InputNumber; normalized: number; scaled: number}>(Base: T) {
    return class extends Base implements ZKLocusAdopter<InputNumber, number, Int64> {

        /**
         * Returns the raw value of the number. This is the value that the user provided.
         * @returns The raw value of the number.
         */
        rawValue(): InputNumber {
            return this.raw;
        }

        /**
         * Returns the normalized value of the number. This is the value that will be used in the zkSNARK.
         * @returns The normalized value of the number.
         */
        normalizedValue(): number {
            return this.normalized;
        }

        /**
         * Converts the number to a zero-knowledge value used by zkLocus (Field).
         * @returns The zero-knowledge value.
         */
        toZKValue(): Int64 {
            // Assuming Int64 is a valid type or class in the provided zkLocus code
            return Int64.from(this.scaled);
        }
    };
}
