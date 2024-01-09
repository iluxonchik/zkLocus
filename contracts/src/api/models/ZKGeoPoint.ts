import type { Field, Int64 } from "o1js";
import type { InputNumber } from "../Types";
import type { GeoPoint } from "../../model/Geography";
import type { ZKLocusAdopter } from "../adopters/Interfaces";
import ZKGeoPointToGeoPointAdopter from "../adopters/ZKGeoPointToGeoPointAdopter";
import { IZKGeoPointProver } from "../provers/IZKGeoPointProver";
import ZKGeoPointProver from "../provers/ZKGeoPointProver";
import type { ZKNumber } from "./ZKNumber";
import { ZKLatitude } from "./ZKLatitude";
import { ZKLongitude } from "./ZKLongitude";


function int64ToNumber(value: Int64): number {
    const maginitueAsBigInt: BigInt = value.magnitude.toBigInt();
    const magnitudeAsNumber: number = Number(maginitueAsBigInt);
    if (value.sgn.isPositive()) {
        return magnitudeAsNumber;
    } else {
        return -magnitudeAsNumber;
    }

}

/*
    Represents a geographical point in TypeScript that will be converted into a zkLocus geographical point.
    A zkLocus geographical point is one that can be used in a zero-knowledge circuit. zkLocus uses O1JS to
    implement zero-knowledge circuits, so a zkLocus geographical point is one that is represented in a
    valid set of O1JS structures.

    All of the zero-knowledge functionality is also avaialbe on this class, namely:

    1. Proving wether a point is in polygon
    2. Proving the exact location.
*/
@ZKGeoPointProver
@ZKGeoPointToGeoPointAdopter
export class ZKGeoPoint {
    protected _latitude: ZKLatitude;
    protected _longitude: ZKLongitude;
    protected _rawValue: { latitude: InputNumber | ZKLatitude; longitude: InputNumber | ZKLongitude; };

    constructor(latitude: InputNumber | ZKLatitude, longitude: InputNumber | ZKLongitude) {
        this._rawValue = {
            latitude: latitude,
            longitude: longitude,
        };

        this._latitude = latitude instanceof ZKLatitude ? latitude : new ZKLatitude(latitude);
        this._longitude = longitude instanceof ZKLongitude ? longitude : new ZKLongitude(longitude);
    }

    get latitude(): ZKLatitude {
        return this._latitude;
    }

    get longitude(): ZKLongitude {
        return this._longitude;
    }

    get asRawValue(): { latitude: InputNumber | ZKLatitude; longitude: InputNumber | ZKLongitude; } {
        return this._rawValue;
    }

    get factor(): number {
        return Math.max(this.latitude.factor, this.longitude.factor);
    }

    /*
    * Create a ZKGeoPoint from a GeoPoint.
    */
    static fromGeoPoint(geoPoint: GeoPoint): ZKGeoPoint {
        const latitude: Int64 = geoPoint.latitude;
        const longitude: Int64 = geoPoint.longitude;
        const factor: Int64 = geoPoint.factor;

        const latitudeAsNumber: number = Number(latitude.toString());
        const longitudeAsNumber: number = Number(longitude.toString());
        const factorAsNumber: number = Number(factor.toString());

        const latitudeDecimal: number = latitudeAsNumber / factorAsNumber;
        const longitudeDecimal: number = longitudeAsNumber / factorAsNumber;

        return new ZKGeoPoint(latitudeDecimal, longitudeDecimal);
    }

    /*
    * Obtain the GeoPoint representation of this ZKGeoPoint.
    */
    toGeoPoint(): GeoPoint {
        return this.toZKValue();
    }

    hash(): Field {
        return this.toZKValue().hash();
    }

    /**
     * Checks if the current ZKGeoPoint is equal to another ZKGeoPoint.
     * @param other The ZKGeoPoint to compare with.
     * @returns True if the ZKGeoPoints are equal, false otherwise.
     */
    isEquals(other: ZKGeoPoint): boolean {
        return this.latitude.isEquals(other.latitude) && this.longitude.isEquals(other.longitude);
    }    

}
// Declaration merging to augment the ZKGeoPoint class with the additional properties and methods of the ZKInterface
export interface ZKGeoPoint extends ZKLocusAdopter<{ latitude: InputNumber | ZKLatitude; longitude: InputNumber | ZKLongitude; }, { latitude: ZKLatitude; longitude: ZKLongitude; factor: ZKNumber; }, GeoPoint>, IZKGeoPointProver { }
