import { Struct, Poseidon, Int64, UInt64, Field } from "o1js";
import { TimeStampInterval } from './Time';


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

export class GeoPoint extends Struct({
  latitude: Int64,
  longitude: Int64,
  factor: Int64, // see note in docs
}) {
  hash(): Field {
    return Poseidon.hash([
      this.latitude.toField(),
      this.longitude.toField(),
      this.factor.toField(),
    ]);
  }

  toFields(): Field[] {
    return [
      this.latitude.toField(),
      this.longitude.toField(),
      this.factor.toField(),
    ];
  }

  assertIsValid(): void {
    // First, asser that the provided latidude and logitude values are within the accepted range
    this.latitude.div(this.factor).magnitude.assertLessThanOrEqual(UInt64.from(90));
    this.longitude.magnitude.assertLessThanOrEqual(UInt64.from(180));
    this.factor.magnitude.assertLessThanOrEqual(UInt64.from(10n ** 7n)); // maximum percions is 7 decimal points
  }
}

/**
 * Represents a geographical point, with a timestamp.
 */
export class GeoPointWithTimestamp extends Struct({
  point: GeoPoint,
  timestamp: TimeStampInterval,
}) {
  hash() {
    return Poseidon.hash([
      this.point.hash(),
      this.timestamp.hash(),
    ]);
  }
}

export class ThreePointPolygon extends Struct({
  vertice1: GeoPoint,
  vertice2: GeoPoint,
  vertice3: GeoPoint,
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
  assertIsValid(): void {
    this.assertIsVerticesValid();
    this.assertIsOrderingValid();
  }

  private assertIsVerticesValid(): void {
    this.vertice1.assertIsValid();
    this.vertice2.assertIsValid();
    this.vertice3.assertIsValid();
  }

  private assertIsOrderingValid(): void {
    // TODO: assert that the points in the polygon are correcly ordered
  }
}

