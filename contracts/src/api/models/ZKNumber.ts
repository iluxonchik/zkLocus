import { Int64 } from "o1js";
import { InputNumber } from "../Types";
import ZKNumberToInt64Adopter from "../adopters/ZKNumberToInt64Adopter";
import { ZKLocusAdopter } from "../adopters/Interfaces";

/**
 * Represents a ZKNumber, which is a wrapper class for numeric values used in zkLocus.
 * The ZKNumber class provides methods to access the raw, normalized, and scaled values of the number,
 * as well as the factor and number of decimals.
 * The number will be converted to the Fields of a zkSNARK in zkLocus.
 */
@ZKNumberToInt64Adopter
export class ZKNumber {
    protected _raw_value: InputNumber;
    protected _normalized_value: number;
    protected _num_decimals: number;

    /**
     * Creates a new instance of the ZKNumber class.
     * @param value The input number to be wrapped.
     */
    constructor(value: InputNumber) {
        this._raw_value = value;
        this._normalized_value = Number(value);
        this._num_decimals = this.countNumDecimals();
    }

    /**
     * Gets the raw value of the ZKNumber.
     */
    get raw(): InputNumber {
        return this._raw_value;
    }

    /**
     * Gets the normalized value of the ZKNumber.
     */
    get normalized(): number {
        return this._normalized_value;
    }

    /**
     * Gets the scaled value of the ZKNumber.
     */
    get scaled(): number {
        return Math.round(this._normalized_value * Math.pow(10, this._num_decimals));
    }

    /**
     * Gets the factor of the ZKNumber.
     * The factor is a power of 10, and it's equal to 10 ^ num_decimals.
     * For numbers without decimals (i.e. integers), the factor is 1.
     */
    get factor(): number {
        return Math.max(1, 10 ** this._num_decimals);
    }

    /**
     * Counts the number of decimals in the normalized value.
     * @returns The number of decimals.
     */
    protected countNumDecimals(): number {
        const decimalPart = this._normalized_value.toString().split('.')[1];
        return decimalPart ? decimalPart.length : 0;
    }
}
// Declaration merging to augment the ZKNumber class with the additional properties and methods of the ZKInterface
export interface ZKNumber extends ZKLocusAdopter<InputNumber, number, Int64> { }
