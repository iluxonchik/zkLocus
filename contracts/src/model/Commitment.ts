import { Field, Struct, Bool } from "o1js";
import { GeographicalPoint, ThreePointPolygon } from './Geography.js';


export class CoordinateProofState extends Struct({
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

export class CoordinateProofStateWithMetadata extends Struct({
  coordinateProofState: CoordinateProofState,
  metadata: Field,
}) {
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
  point: GeographicalPoint,
  polygon: ThreePointPolygon,
}) {
}
