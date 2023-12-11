import { Int64 } from "o1js";
import { InputNumber } from "../Types";
import { ZKLocusAdopter } from "./Interfaces";

export default function<T extends new (...args: any[]) => { raw: InputNumber; normalized: number; }>(Base: T) {
    return class extends Base implements ZKLocusAdopter<InputNumber, number, Int64> {

        /*
            Returns the raw value of the number. This is the value that the user provided.
        */
        rawValue(): InputNumber {
            return this.raw;
        }
        /*
             Returns the normalized value of the number. This is the value that will be used in the zkSNARK.
        */
        normalizedValue(): number {
            return this.normalized;
        }

        toZKValue(): Int64 {
            // Assuming Int64 is a valid type or class in the provided zkLocus code
            return Int64.from(this.normalizedValue());
        }
    };
}
