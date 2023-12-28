import { InputNumber } from "../Types";
import { ZKCoordinate } from "./ZKCoordinate";

/**
 * Represents a longitude coordinate.
 * The longitude that will be converted to the Fields of a zkSNARK in zkLocus.
 */
export class ZKLongitude extends ZKCoordinate {

    /**
     * Creates a new instance of ZKLongitude.
     * @param value The value of the longitude coordinate.
     * @throws Error if the longitude value is invalid.
     */
    constructor(value: InputNumber) {
        super(value);
        const valueAsInteger: number = Math.abs(Number(value));
        if (valueAsInteger > 180) {
            throw new Error("Invalid longitude value");
        }
    }
}
