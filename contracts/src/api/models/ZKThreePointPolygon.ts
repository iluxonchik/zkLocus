import { RawCoordinates } from "../Types";
import { GeoPoint, ThreePointPolygon } from "../../model/Geography";
import ZKThreePointPolygonToThreePointPolygonAdopter from "../adopters/ZKThreePointPolygonToThreePointPolygonAdopter";
import { ZKLocusAdopter } from "../adopters/Interfaces";
import { ZKLatitude } from "./ZKLatitude";
import { ZKLongitude } from "./ZKLongitude";
import { ZKGeoPoint } from "./ZKGeoPoint";

/*
Interface for the ThreePointPolygon zkLocus class. It represents a three point polygon, also refered to as a "geogrpahical area".
*/


@ZKThreePointPolygonToThreePointPolygonAdopter
export class ZKThreePointPolygon {
    private _vertices: [ZKGeoPoint, ZKGeoPoint, ZKGeoPoint];

    get vertices(): [ZKGeoPoint, ZKGeoPoint, ZKGeoPoint] {
        return this._vertices;
    }

    constructor(vertex1: ZKGeoPoint | RawCoordinates, vertex2: ZKGeoPoint | RawCoordinates, vertex3: ZKGeoPoint | RawCoordinates) {
        this._vertices = [
            vertex1 instanceof ZKGeoPoint ? vertex1 : new ZKGeoPoint(new ZKLatitude(vertex1.latitude), new ZKLongitude(vertex1.longitude)),
            vertex2 instanceof ZKGeoPoint ? vertex2 : new ZKGeoPoint(new ZKLatitude(vertex2.latitude), new ZKLongitude(vertex2.longitude)),
            vertex3 instanceof ZKGeoPoint ? vertex3 : new ZKGeoPoint(new ZKLatitude(vertex3.latitude), new ZKLongitude(vertex3.longitude))
        ];
    }

    /**
     * Gets the maximum factor value among the vertices of the polygon.
     * @returns The maximum factor value.
     */
    get factor(): number {
        return Math.min(this.vertices[0].factor, this.vertices[1].factor, this.vertices[2].factor);
    }

}

export interface ZKThreePointPolygon extends ZKLocusAdopter<[ZKGeoPoint, ZKGeoPoint, ZKGeoPoint], [GeoPoint, GeoPoint, GeoPoint], ThreePointPolygon> { }
