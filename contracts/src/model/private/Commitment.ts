import { Field, Struct, Bool } from "o1js";
import { GeoPoint, ThreePointPolygon } from '../Geography.js';
import { TimeStampInterval } from "../Time.js";


export class GeoPointInPolygonCommitment extends Struct({
  polygonCommitment: Field,
  geoPointCommitment: Field,
  isInPolygon: Bool,
}) {
  toString(): string {
    return `Polygon Commitment: ${this.polygonCommitment.toString()}\nCoordinates Commitment: ${this.geoPointCommitment.toString()}\nIs In Polygon: ${this.isInPolygon.toString()}`;
  }
};


/**
 * Two-dimensional private geolocation commitment. It repreesents a commitment to a GeoPoint being outside a list of polygons and inside a list of polygons.
 * 
 * IMPORTANT: This commitment expression should only be utilized in the case of 
 */
export class GeoPointInOutPolygonCommitment extends Struct({
  insidePolygonCommitment: Field,
  outsidePolygonCommitment: Field,
  coordinatesCommitment: Field,
}) {
  toString(): string {
    return `Inside Polygon Commitment: ${this.insidePolygonCommitment.toString()}\nOutside Polygon Commitment: ${this.outsidePolygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}`;
  }
}

export class ProoveCoordinatesIn3dPolygonArgumentsValues extends Struct({
  point: GeoPoint,
  polygon: ThreePointPolygon,
}) {
}

export class GeoPointWithTimeStampIntervalInPolygonCommitment extends Struct({
  geoPointInPolygonCommitment: GeoPointInPolygonCommitment,
  timestamp: TimeStampInterval,
}) {
  toString(): string {
    return `Coordinate In Polygon Commitment State: ${this.geoPointInPolygonCommitment.toString()}\nT imestamp: ${this.timestamp.toString()}`;
  }
}

export class GeoPointCommitment extends Struct({
  geoPoint: GeoPoint,
}) {
  toString(): string {
    return `GeoPoint: ${this.geoPoint.toString()}`;
  }
}