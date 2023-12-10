/*
    This file defines the Adaptor that converts a ZKGeoPoint to a GeoPoint.

    It's defined in a separate file and exported as a default export, due to TS4094 which presents issues
    when an exported class experssion contains private or protected members. The approach followed in this file
    serves as a workaround for this issue.

    See: https://github.com/microsoft/TypeScript/issues/30355
*/

import { Int64 } from "o1js";
import { GeoPoint } from "../../../model/Geography";
import { ZKLocusAdopter } from "../../Adopters";
import { ZKGeoPoint, ZKLatitude, ZKLongitude, ZKNumber } from "../../Models";
import { InputNumber } from "../../Types";

export type ZKGeoPointConstructor = new (...args: any[]) => ZKGeoPoint;

export default function <T extends ZKGeoPointConstructor>(Base: T) {
    return class extends Base implements ZKLocusAdopter<{ latitude: InputNumber | ZKLongitude; longitude: InputNumber | ZKLongitude; }, { latitude: ZKLatitude; longitude: ZKLongitude; factor: ZKNumber; }, GeoPoint> {

        rawValue(): { latitude: InputNumber | ZKLatitude; longitude: InputNumber | ZKLongitude; } {
            return this.asRawValue;
        }
        

        normalizedValue(): { latitude: ZKLatitude; longitude: ZKLongitude; factor: ZKNumber; } {
            const factorAsNumber: number = 10 ** this.latitude.num_decimals;
            const factor: ZKNumber = new ZKNumber(factorAsNumber);
            const latitude: ZKLatitude = new ZKLatitude(this.latitude.normalized);
            const longitude: ZKLongitude = new ZKLongitude(this.longitude.normalized);
            return {
                latitude,
                longitude,
                factor,
            };
        }

        toZKValue(): GeoPoint {
            const scaledLatitude = this.latitude.normalized * Math.pow(10, 7);
            const scaledLongitude = this.longitude.normalized * Math.pow(10, 7);

            return new GeoPoint({
                latitude: Int64.from(scaledLatitude),
                longitude: Int64.from(scaledLongitude),
                factor: Int64.from(this.latitude.num_decimals)
            });
        }
    };

}