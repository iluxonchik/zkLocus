import { Struct, Poseidon, Int64, UInt64, Field } from "o1js";
import { IntervalTimestamp } from './Time';
/** Data Structures */
/**
 * Represents a geographical point. The point is represented as a pair of latitude and longitude values.
 * The latitude and longitude values are represented as Field values. The Field values are scaled to
 * the desired factor, in order to represent the desired percision. The percision is represented as
 * a Field value. The percision is the number of decimal points that the latitude and longitude values
 * have. For example, if the percision is 7, then the latitude and longitude values are scaled to
 * 7 decimal points. The latitude and longitude values are scaled by multiplying them with 10^7.
 * 10^7 is the scale factor. `factor` is used instead of percision to optimize the efficency, as it prevent
  the need to perform exponentiation computations
 */
export class GeographicalPoint extends Struct({
    latitude: Int64,
    longitude: Int64,
    factor: Int64, // see note in docs
}) {
    hash() {
        return Poseidon.hash([
            this.latitude.toField(),
            this.longitude.toField(),
            this.factor.toField(),
        ]);
    }
    assertIsValid() {
        // First, asser that the provided latidude and logitude values are within the accepted range
        this.latitude.div(this.factor).magnitude.assertLessThanOrEqual(UInt64.from(90));
        this.longitude.magnitude.assertLessThanOrEqual(UInt64.from(180));
        this.factor.magnitude.assertLessThanOrEqual(UInt64.from(10n ** 7n)); // maximum percions is 7 decimal points
    }
}
export class GeographicalPointWithTimestamp extends Struct({
    point: GeographicalPoint,
    timestamp: IntervalTimestamp,
}) {
    hash() {
        return Poseidon.hash([
            this.point.hash(),
            this.timestamp.hash(),
        ]);
    }
}
export class NoncedGeographicalPoint extends Struct({
    point: GeographicalPoint,
    nonce: Field,
}) {
    hash() {
        return Poseidon.hash([this.point.hash(), this.nonce]);
    }
    assertIsValid() {
        this.point.assertIsValid();
    }
}
export class ThreePointPolygon extends Struct({
    vertice1: GeographicalPoint,
    vertice2: GeographicalPoint,
    vertice3: GeographicalPoint,
}) {
    hash() {
        return Poseidon.hash([
            this.vertice1.hash(),
            this.vertice2.hash(),
            this.vertice3.hash(),
        ]);
    }
    /**
     * Ensure that the `ThreePointPolygon` instance is valid. This includes
     * asserting that the coordinates are within the allowed values, and that
     * those coordinates are ordered correctly.
     */
    assertIsValid() {
        this.assertIsVerticesValid();
        this.assertIsOrderingValid();
    }
    assertIsVerticesValid() {
        this.vertice1.assertIsValid();
        this.vertice2.assertIsValid();
        this.vertice3.assertIsValid();
    }
    assertIsOrderingValid() {
        // TODO: assert that the points in the polygon are correcly ordered
    }
}
class IntervalTimeStamp extends Struct({
    start: Field,
    end: Field,
}) {
}
class LiteralCoordinatesAndTimeStamp extends Struct({
    point: NoncedGeographicalPoint,
    timestamp: IntervalTimeStamp,
}) {
}
//# sourceMappingURL=Geography.js.map