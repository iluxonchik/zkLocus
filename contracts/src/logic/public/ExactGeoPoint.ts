import { Field } from "o1js";
import { GeoPoint } from "../../model/Geography";
import { GeoPointCommitment } from "../../model/public/Commitment";
import { GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";


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
