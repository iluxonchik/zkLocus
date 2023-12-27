import { Field, Struct} from "o1js";

export class GeoPointCommitment extends Struct({
  geoPointHash: Field,
}) {
  toString(): string {
    return `GeoPoint: ${this.geoPointHash.toString()}`;
  }
}