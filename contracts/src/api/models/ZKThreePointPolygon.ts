import { RawCoordinates } from "../Types";
import { GeoPoint, ThreePointPolygon } from "../../model/Geography";
import ZKThreePointPolygonToThreePointPolygonAdopter from "../adopters/ZKThreePointPolygonToThreePointPolygonAdopter";
import { HashableZKLocusAdopter, ZKLocusAdopter, ZKLocusHashable } from "../adopters/Interfaces";
import { ZKLatitude } from "./ZKLatitude";
import { ZKLongitude } from "./ZKLongitude";
import { ZKGeoPoint } from "./ZKGeoPoint";
import { Field, Poseidon } from "o1js";

/*
Interface for the ThreePointPolygon zkLocus class. It represents a three point polygon, also refered to as a "geogrpahical area".
*/
@ZKThreePointPolygonToThreePointPolygonAdopter
export class ZKThreePointPolygon implements ZKLocusHashable<ZKThreePointPolygon, Field>{
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
        return Math.max(this.vertices[0].factor, this.vertices[1].factor, this.vertices[2].factor);
    }

    hash(): Field { 
        return this.toZKValue().hash();
    }

    combinedHash(elements: ZKThreePointPolygon[]): Field {
        const allPolygons: ZKThreePointPolygon[] = [this, ...elements];
        return ZKThreePointPolygon.combinedHash(allPolygons);
    }

    static combinedHash(polygons: ZKThreePointPolygon[]): Field {
        if (polygons.length === 0){
            throw new Error('Cannot combine hash of empty array of polygons.');
        }


        const hashes: Field[] = polygons.map(polygon => polygon.toZKValue().hash());
        
        if (hashes.length === 1){    
            return hashes[0];
        }
        return Poseidon.hash(hashes);
    }

    static fromThreePointPolygon(threePointPolygon: ThreePointPolygon): ZKThreePointPolygon {
            const vertices = [
                ZKGeoPoint.fromGeoPoint(threePointPolygon.vertice1),
                ZKGeoPoint.fromGeoPoint(threePointPolygon.vertice2),
                ZKGeoPoint.fromGeoPoint(threePointPolygon.vertice3)
            ];

            return new this(vertices[0], vertices[1], vertices[2]);
        }
}

export interface ZKThreePointPolygon extends HashableZKLocusAdopter<[ZKGeoPoint, ZKGeoPoint, ZKGeoPoint], [GeoPoint, GeoPoint, GeoPoint], ThreePointPolygon, ZKThreePointPolygon, Field> { }
