import { Field, Poseidon, Struct } from "o1js";

/**
 * Represents a GeoPoint that is authenticated by an Oracle. The Oracle is cryptographically attached to the
 * source by having its public key included in the commitment. When used, this commitment should attest that
 * the GeoPoint whose hash is included in the commitment was indeed signed by the private key of the public key
 * included in the commitment.
 */
export class OracleAuthenticatedGeoPointCommitment extends Struct({
  publicKeyHash: Field,
  geoPointHash: Field
}) {
    toString(): string {
        return `Public Key Hash: ${this.publicKeyHash.toString()}\nGeoPoint Hash: ${this.geoPointHash.toString()}`;
    }

    hash(): Field {
        return Poseidon.hash([this.publicKeyHash, this.geoPointHash]);
    }
}

