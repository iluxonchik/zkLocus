import { Empty, Field, Poseidon, Provable, SelfProof } from "o1js";
import { GeoPointInOutPolygonCommitment, GeoPointInPolygonCommitment } from "../../model/private/Commitment";
import { GeoPointInPolygonCircuitProof } from "../../zkprogram/private/GeoPointInPolygonCircuit";


/**
 * Creates a GeoPointInOutPolygonCommitment object based on the provided inside and outside proofs.
 * 
 * @param insideProof - The proof of the GeoPoint being inside a polygon.
 * @param outsideProof - The proof of the GeoPoint being outside a polygon.
 * @returns A GeoPointInOutPolygonCommitment object.
 */
export async function fromPointInPolygonProofs(
    insideProof: GeoPointInPolygonCircuitProof,
    outsideProof: GeoPointInPolygonCircuitProof,
): Promise<GeoPointInOutPolygonCommitment> {
    insideProof.verify();
    const insideProofCommitment: GeoPointInPolygonCommitment = insideProof.publicOutput;
    insideProofCommitment.isInPolygon.assertTrue("`insideProof` is not a proof of a GeoPoint being inside a polygon, but rather outside.");

    outsideProof.verify();
    const outsideProofCommitment: GeoPointInPolygonCommitment = outsideProof.publicOutput;
    outsideProofCommitment.isInPolygon.assertFalse("`outsideProof` is not a proof of a GeoPoint being outside a polygon, but rather inside.");

    const insideGeoPointCommitment: Field = insideProofCommitment.geoPointCommitment;
    const outsideGeoPointCommitment: Field = outsideProofCommitment.geoPointCommitment;
    insideGeoPointCommitment.assertEquals(outsideGeoPointCommitment, "`insideProof` and `outsideProof` are not proofs of the same GeoPoint being inside and outside a polygon, respectively.") 

    const insidePolygonCommitment: Field = insideProofCommitment.polygonCommitment;
    const outsidePolygonCommitment: Field = outsideProofCommitment.polygonCommitment;
    

    return new GeoPointInOutPolygonCommitment({
        insidePolygonCommitment: insidePolygonCommitment,
        outsidePolygonCommitment: outsidePolygonCommitment,
        coordinatesCommitment: insideGeoPointCommitment,
    });  
}


/**
 * Extends a self-proof and a point-in-polygon proof to create a commitment to a GeoPoint inside or outside a polygon.
 * If the `pointInPolygonProof` is a proof of the GeoPoint being inside the polygon, then the `selfProof`'s public output
 * `insidePolygonCommitment` will be extended with the `pointInPolygonProof`'s public output `polygonCommitment`.
 * If the `pointInPolygonProof` is a proof of the GeoPoint being outside the polygon, then the `selfProof`'s public output
 * `outsidePolygonCommitment` will be extended with the `pointInPolygonProof`'s public output `polygonCommitment`.
 * 
 * @param selfProof The self-proof of the geo point being inside or outside the polygon.
 * @param pointInPolygonProof The point-in-polygon proof of the geo point being inside the polygon.
 * @returns The commitment to the geo point inside or outside the polygon.
 */
export async function extendWithPointInPolygonProof(
    selfProof: SelfProof<Empty, GeoPointInOutPolygonCommitment>,
    pointInPolygonProof: GeoPointInPolygonCircuitProof,
): Promise<GeoPointInOutPolygonCommitment> {
    selfProof.verify();
    pointInPolygonProof.verify();

    const selfProofCommitment: GeoPointInOutPolygonCommitment = selfProof.publicOutput;
    const pointInPolygonProofCommitment: GeoPointInPolygonCommitment = pointInPolygonProof.publicOutput;

    selfProofCommitment.coordinatesCommitment.assertEquals(pointInPolygonProofCommitment.geoPointCommitment, "`selfProof` and `pointInPolygonProof` are not proofs of the same GeoPoint.");

    const extendedCommitmentInside: GeoPointInOutPolygonCommitment = new GeoPointInOutPolygonCommitment({
        insidePolygonCommitment: Poseidon.hash([pointInPolygonProofCommitment.polygonCommitment, pointInPolygonProofCommitment.polygonCommitment]),
        outsidePolygonCommitment: selfProofCommitment.outsidePolygonCommitment,
        coordinatesCommitment: pointInPolygonProofCommitment.geoPointCommitment,
    });

    const extendedCommitmentOutside: GeoPointInOutPolygonCommitment = new GeoPointInOutPolygonCommitment({
        insidePolygonCommitment: selfProofCommitment.insidePolygonCommitment,
        outsidePolygonCommitment: Poseidon.hash([pointInPolygonProofCommitment.polygonCommitment, pointInPolygonProofCommitment.polygonCommitment]),
        coordinatesCommitment: pointInPolygonProofCommitment.geoPointCommitment,
    });

    const extendedCommitment: GeoPointInOutPolygonCommitment = Provable.if(
        pointInPolygonProofCommitment.isInPolygon,
        GeoPointInOutPolygonCommitment,
        extendedCommitmentInside,
        extendedCommitmentOutside,
    );

    return extendedCommitment; 
}