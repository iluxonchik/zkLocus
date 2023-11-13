import { Field, Struct, Bool } from "o1js";
import { GeoPoint, ThreePointPolygon } from '../Geography.js';
import { TimestampInterval } from "../Time.js";


export class GeoPointInPolygonCommitment extends Struct({
  polygonCommitment: Field,
  // TODO: consider including outSidePolygonCommitment proofs, in order to inlcude the "inner" and "outer" polygon definitions of GeoJSON
  //outsidePolygonCommitment: Field,
  coordinatesCommitment: Field,
  isInPolygon: Bool,
}) {
  toString(): string {
    return `Polygon Commitment: ${this.polygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}\nIs In Polygon: ${this.isInPolygon.toString()}`;
  }
}

;
export class CoordinatePolygonInclusionExclusionProof extends Struct({
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

export class GeoPointWithTimestampIntervalInPolygonCommitment extends Struct({
  geoPointInPolygonCommitment: GeoPointInPolygonCommitment,
  timestamp: TimestampInterval, 
}){
  toString(): string {
    return `Coordinate In Polygon Commitment State: ${this.geoPointInPolygonCommitment.toString()}\nT imestamp: ${this.timestamp.toString()}`;
  }
}
