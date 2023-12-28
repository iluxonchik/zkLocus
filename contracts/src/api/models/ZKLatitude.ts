import { InputNumber } from "../Types";
import { ZKCoordinate } from "./ZKCoordinate";

/**
 * Represents a latitude coordinate.
 * The latitude that will be converted to the Fields of a zkSNARK in zkLocus.
 * Extends the ZKCoordinate class.
 */
export class ZKLatitude extends ZKCoordinate {
    /**
     * Creates a new instance of ZKLatitude.
     * @param value - The latitude value.
     * @throws Error if the latitude value is invalid.
     */
    constructor(value: InputNumber) {
        super(value);
        const valueAsInteger = Math.abs(Number(value));
        if (valueAsInteger > 90) {
            throw new Error("Invalid latitude value");
        }
    }
}
