import { Field, Struct} from "o1js";

export class GeoPointCommitment extends Struct({
  geoPointHash: Field,
}) {
  toString(): string {
    return `GeoPoint: ${this.geoPointHash.toString()}`;
  }
}

export class MetadataGeoPointCommitment extends Struct({
  geoPointHash: Field,
  metadataHash: Field,
}) {
  toString(): string {
    return `GeoPoint ${this.geoPointHash.toString()}. Metadata: ${this.metadataHash.toString()}`;
  }
}

