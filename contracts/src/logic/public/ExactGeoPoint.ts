import { Field, Poseidon } from "o1js";
import { GeoPoint } from "../../model/Geography";
import { GeoPointCommitment, MetadataGeoPointCommitment } from "../../model/public/Commitment";
import { GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";
import { Bytes64, SHA3_512 } from "../../api/sha3/SHA3";


/*
* Create a commitment to an exact GeoPoint provided by a GeoPointProviderCircuitProof.
* 
* WARNING: The GeoPoint's latitude and longitude are visible to any external party. This method must only be used
*   when sharing of the exact GeoGraphical coordinates is desirable.
*
* The return value (`GeoPointCommitment`) can be combined with a Nonce for semi-private geolocation sharing.
*/
export function proveExactGeoPointFromProvider(geoPointProviderProof: GeoPointProviderCircuitProof): GeoPointCommitment {
    geoPointProviderProof.verify();
    const geoPoint: GeoPoint = geoPointProviderProof.publicOutput;
    const geoPointHash: Field = geoPoint.hash();

    return new GeoPointCommitment({
        geoPointHash: geoPointHash
    });
}


export function attachMetadataToGeoPoint(geoPointProviderProof: GeoPointProviderCircuitProof, sha3_512: Bytes64): MetadataGeoPointCommitment {
    geoPointProviderProof.verify();
    const geoPoint: GeoPoint = geoPointProviderProof.publicOutput;
    const geoPointHash: Field = geoPoint.hash();
    const sha3_512PoseidonHash: Field = Poseidon.hash(sha3_512.toFields());

    return new MetadataGeoPointCommitment({
        geoPointHash: geoPointHash,
        metadataHash: sha3_512PoseidonHash
    });
}
