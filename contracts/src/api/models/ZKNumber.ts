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
    protected _factor: number;

    /**
     * Checks if the current ZKNumber is equal to another ZKNumber.
     * @param other The ZKNumber to compare with.
     * @returns True if the ZKNumbers are equal, false otherwise.
     */
    isEquals(other: ZKNumber): boolean {
        return this.normalized === other.normalized;
    }

    isGreaterThan(other: ZKNumber): boolean {
        return this.normalized > other.normalized;
    }

    /**
     * Creates a new instance of the ZKNumber class.
     * @param value The input number to be wrapped.
     */
    constructor(value: InputNumber) {
        this._raw_value = value;
        const decimalValue: Decimal = new Decimal(value);
        this._normalized_value = Number(decimalValue);
        this._num_decimals = decimalValue.decimalPlaces();
        this._factor = ZKNumber.computeFactorForNumber(this._normalized_value);
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
        const factorDecimal = new Decimal(this.factor);
        const scaledDecimal = nomralizedDecimal.mul(factorDecimal);
        const fixedDecimal = scaledDecimal.toFixed(0);
        return Number(fixedDecimal);
    }

    /**
     * Increases the factor of the ZKNumber.
     *
     * NOTE: this will be refactored in the future.
     * @param factor - The factor to increase by.
     * @throws Error if the specified factor is less than the current factor.
     */
    increaseFactor(factor: number): void {
        if (factor >= this._factor) {
            this._factor = factor;
        } else {
            throw new Error(`Cannot set factor to ${factor} because it is less than the current factor ${this._factor}`);
        }
    }

    /**
     * Gets the factor of the ZKNumber.
     * The factor is a power of 10, and it's equal to 10 ^ num_decimals.
     * For numbers without decimals (i.e. integers), the factor is 1.
     */
    get factor(): number {
        return this._factor;
    }

    private static computeFactorForNumber(value: number): number {
        const decimalValue = new Decimal(value);
        const numDecimals = decimalValue.decimalPlaces();
        const decimalFactor = new Decimal(10).pow(numDecimals);
        const decimalFactorFixed = decimalFactor.toFixed(0);
        return Number(decimalFactorFixed);
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

    toString(): string {
        return `ZKNumber(Raw: ${this.raw}, Normalized: ${this.normalized}, Scaled: ${this.scaled}, Factor: ${this.factor}, NumDecimals: ${this.numDecimals})`;
    }
    
}
// Declaration merging to augment the ZKNumber class with the additional properties and methods of the ZKInterface
export interface ZKNumber extends ZKLocusAdopter<InputNumber, number, Int64> { }
