import { Hash } from "crypto";


export interface ZKLocusHashable <HashElementType, HashResultType> {
    hash(): HashResultType;
    combinedHash(elements: HashElementType[]): HashResultType;
    combinedHash(otherElements: HashElementType[]): HashResultType;
}

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

export interface HashableZKLocusAdopter<R, N, Z, HashElementType, HashResultType> extends ZKLocusAdopter<R, N, Z>, ZKLocusHashable<HashElementType, HashResultType> {

    hash(): HashResultType;
    combinedHash(elements: HashElementType[]): HashResultType;
    combinedHash(otherElements: HashElementType[]): HashResultType;
}
