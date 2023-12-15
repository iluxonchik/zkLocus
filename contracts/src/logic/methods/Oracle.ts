import { Bool, Poseidon, PublicKey, Signature } from "o1js";
import { GeoPoint } from "../../model/Geography";
import { OracleAuthenticatedGeoPoint } from "../../model/private/Oracle";

export function extractGeoPointFromSignature(signature: Signature, publicKey: PublicKey, geoPoint: GeoPoint) {
    // Verify if the signature is made by the provided public key over the GeoPoint.
    const isValidSignature: Bool = signature.verify(publicKey, geoPoint.toFields());
    isValidSignature.assertTrue();

    // Compute the Poseidon hash of the public key.
    const publicKeyHash = Poseidon.hash(publicKey.toFields());

    // Compute the hash of the GeoPoint
    const geoPointHash = geoPoint.hash();

    // Return the commitment the public key hash and the GeoPoint hash.
    return new OracleAuthenticatedGeoPoint({
      publicKeyHash,
      geoPointHash
    });
}