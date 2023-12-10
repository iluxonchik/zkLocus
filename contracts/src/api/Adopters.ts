
/*
    Represents interface that converts a type into a zkLocus value.
    This is used to convert TypeScript types into zkLocus-supported types.

    Any type that implements ZKLocusAdopter becomes a type that "adopts" to zkLocus's internal types. Its ultimate purpose is to be used
    as a class decorator. Any class that gets decorated ZKLocusAdopter will be augmented with the additional properties and methods of the
    ZKLocusAdopter interface. As such, any class that gets decorated with with a function that returns a class that implements ZKLocusAdopter
    becomes an "adopter" of zkLocus, as it provides a way to convert the types into zkLocus types.

    The values are converted in the following order:
    1. rawValue: The value that the user provided. This value can be either an API type or a TypeScript native type. It gets converted into a normalized value.
    2. normalizedValue: The normalized value of the type. This value is the normalized raw value. This value is an
        API type, and should not be a TypeScript native type. It gets converted into a zkLocus value.
    3. toZKValue: The zkLocus value of the type. This is the value that will be used in zkLocus. This value must be of type

    Raw, normalized and ZK are the different states of the same value. The value begins as a raw value, and then it gets normalized, and then it gets converted into a zkLocus value.
*/

import { Int64 } from "o1js";
import { InputNumber } from "./Types";
import ZKGeoPointToGeoPointAdopter from "./internal/adopters/ZKGeoPointToGeoPointAdopter";

export { ZKGeoPointToGeoPointAdopter };

export interface ZKLocusAdopter<R, N, Z> {
    /*
        Returns the raw value of the type. This is the value that the user provided. This value can be either
        an API type or a TypeScript native type.
    */
    rawValue(): R;

    /*
        Returns the normalized value of the type. This value is the normalized raw value. This value is an
        API type, and should not be a TypeScript native type.

        A normalized value is easily convertible into a zkLocus value.
    */
    normalizedValue(): N;

    /*
        Returns the zkLocus value of the type. This is the value that will be used in zkLocus. This value must be of type
        the zkLocus implentation operats upon. For example, if the zkLocus implementation operates on Int64, then this
        value must be of type Int64.

        In practice, these value types are directly compatile the types used inside the recursive zkSNARKs circuits of zkLocus.

    */
    toZKValue(): Z;
}

export function ZKNumberToInt64Adopter<T extends new (...args: any[]) => { raw: InputNumber; normalized: number; }>(Base: T) {
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

