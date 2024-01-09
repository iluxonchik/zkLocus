/*
    This file defines the Adaptor that converts/adapts a ZKThreePointPolygon into a ThreePointPolygon.

    It's defined in a separate file and exported as a default export, due to TS4094 which presents issues
    when an exported class experssion contains private or protected members. The approach followed in this file
    serves as a workaround for this issue.

    See: https://github.com/microsoft/TypeScript/issues/30355
*/

import { GeoPoint, ThreePointPolygon } from "../../model/Geography";
import type { ZKThreePointPolygon } from "../models/ZKThreePointPolygon";
import { ZKGeoPoint } from "../models/ZKGeoPoint";
import { ZKLocusAdopter } from "./Interfaces";


export default function <T extends new (...args: any[]) => ZKThreePointPolygon>(Base: T) {
    return class extends Base implements ZKLocusAdopter<[ZKGeoPoint, ZKGeoPoint, ZKGeoPoint], [GeoPoint, GeoPoint, GeoPoint], ThreePointPolygon> {
        rawValue(): [ZKGeoPoint, ZKGeoPoint, ZKGeoPoint] {
            return this.vertices;
        }

        normalizedValue(): [GeoPoint, GeoPoint, GeoPoint] {
            return [
                this.vertices[0].toZKValue(),
                this.vertices[1].toZKValue(),
                this.vertices[2].toZKValue()
            ];
        }

        toZKValue(): ThreePointPolygon {
            const vertices = this.vertices.map(vertex => vertex.toZKValue());
            const threePointPolygon = new ThreePointPolygon({
                vertice1: vertices[0],
                vertice2: vertices[1],
                vertice3: vertices[2]
            });

            return threePointPolygon;
        }
    };
}
