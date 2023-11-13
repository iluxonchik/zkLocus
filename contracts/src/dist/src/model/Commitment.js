import { Field, Struct, Bool } from "o1js";
import { GeographicalPoint, ThreePointPolygon } from './Geography.js';
import { IntervalTimestamp } from "./Time.js";
export class CoordinateInPolygonCommitment extends Struct({
    polygonCommitment: Field,
    // TODO: consider including outSidePolygonCommitment proofs, in order to inlcude the "inner" and "outer" polygon definitions of GeoJSON
    //outsidePolygonCommitment: Field,
    coordinatesCommitment: Field,
    isInPolygon: Bool,
}) {
    toString() {
        return `Polygon Commitment: ${this.polygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}\nIs In Polygon: ${this.isInPolygon.toString()}`;
    }
}
export class TimestampedCoordinateInPolygonCommitment extends Struct({
    coordinateProofState: CoordinateInPolygonCommitment,
    timestamp: IntervalTimestamp,
}) {
    toString() {
        return `Coordinate In Polygon Commitment State: ${this.coordinateProofState.toString()}\nT imestamp: ${this.timestamp.toString()}`;
    }
}
export class CoordinateProofStateWithMetadata extends Struct({
    coordinateProofState: CoordinateInPolygonCommitment,
    metadata: Field,
}) {
}
;
export class CoordinatePolygonInclusionExclusionProof extends Struct({
    insidePolygonCommitment: Field,
    outsidePolygonCommitment: Field,
    coordinatesCommitment: Field,
}) {
    toString() {
        return `Inside Polygon Commitment: ${this.insidePolygonCommitment.toString()}\nOutside Polygon Commitment: ${this.outsidePolygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}`;
    }
}
export class ProoveCoordinatesIn3dPolygonArgumentsValues extends Struct({
    point: GeographicalPoint,
    polygon: ThreePointPolygon,
}) {
}
//# sourceMappingURL=Commitment.js.map