import { Bool, Poseidon, PublicKey, Signature } from "o1js";
import { OracleAuthenticatedGeoPointCommitment } from "../../model/private/Oracle";
import { GeoPoint } from "../../model/Geography";

export async function extractGeoPointFromSignature(publicKey: PublicKey, signature: Signature, geoPoint: GeoPoint): Promise<OracleAuthenticatedGeoPointCommitment> {
    // Verify if the signature is made by the provided public key over the GeoPoint.
    const isValidSignature: Bool = signature.verify(publicKey, geoPoint.toFields());
    isValidSignature.assertTrue();

    // Compute the Poseidon hash of the public key.
    const publicKeyHash = Poseidon.hash(publicKey.toFields());

    // Compute the hash of the GeoPoint
    const geoPointHash = geoPoint.hash();

    // Return the commitment the public key hash and the GeoPoint hash.
    return new OracleAuthenticatedGeoPointCommitment({
      publicKeyHash,
      geoPointHash
    });
}