import { Int64 } from "o1js";
import { InputNumber } from "../Types";
import ZKNumberToInt64Adopter from "../adopters/ZKNumberToInt64Adopter";
import { ZKLocusAdopter } from "../adopters/Interfaces";
import Decimal from "decimal.js";

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
     * Checks if the current ZKNumber is equal to another ZKNumber.
     * @param other The ZKNumber to compare with.
     * @returns True if the ZKNumbers are equal, false otherwise.
     */
    isEquals(other: ZKNumber): boolean {
        return this.normalized === other.normalized;
    }

    /**
     * Creates a new instance of the ZKNumber class.
     * @param value The input number to be wrapped.
     */
    constructor(value: InputNumber) {
        this._raw_value = value;
        this._normalized_value = Number(new Decimal(value).toFixed(0));
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
        const nomralizedDecimal = new Decimal(this._normalized_value);
        const factorDecimal = new Decimal(10).pow(this._num_decimals);
        const scaledDecimal = nomralizedDecimal.mul(factorDecimal);
        const fixedDecimal = scaledDecimal.toFixed(0);
        return Number(fixedDecimal);
    }

    /**
     * Gets the factor of the ZKNumber.
     * The factor is a power of 10, and it's equal to 10 ^ num_decimals.
     * For numbers without decimals (i.e. integers), the factor is 1.
     */
    get factor(): number {
        const decimal = new Decimal(10).pow(this._num_decimals);
        const decimalFixed = decimal.toFixed(0);
        return Number(decimalFixed);
    }

    get numDecimals(): number {
        return this._num_decimals;
    }

    /**
     * Counts the number of decimals in the normalized value.
     * @returns The number of decimals.
     */
    protected countNumDecimals(): number {
        const decimal: Decimal = new Decimal(this._normalized_value);
        return decimal.decimalPlaces();
    }
    
}
// Declaration merging to augment the ZKNumber class with the additional properties and methods of the ZKInterface
export interface ZKNumber extends ZKLocusAdopter<InputNumber, number, Int64> { }
