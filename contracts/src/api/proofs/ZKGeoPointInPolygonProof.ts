import { JsonProof } from "o1js";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof } from "../../zkprogram/private/Geography";
import type { ZKThreePointPolygon } from "../models/ZKThreePointPolygon";
import type { ZKGeoPoint } from "../models/ZKGeoPoint";
import { GeoPointInPolygonCommitment } from "../../model/private/Commitment";
import { IO1JSProof } from "./Types";
import CachingProofVerificationMiddleware from "./middleware/CachingProofVerificationMiddleware";
import { ZKLocusProof, ZKP, ZKGeoPointInPolygonCommitment } from "./ZKLocusProof";
import { ZKGeoPointProviderCircuitProof } from "./ZKGeoPointProviderCircuitProof";

/**
 * This class represents a proof that a ZKGeoPoint is inside a ZKThreePointPolygon.
 * A
 */

@CachingProofVerificationMiddleware
export class ZKGeoPointInPolygonProof extends ZKLocusProof<GeoPointInPolygonCircuitProof> {
    protected geoPoint: ZKGeoPoint;
    protected threePointPolygon: ZKThreePointPolygon;
    protected static _circuit: ZKP = GeoPointInPolygonCircuit;

    protected static _dependentProofs = [
        ZKGeoPointProviderCircuitProof,
    ];

    constructor(geoPoint: ZKGeoPoint, polygon: ZKThreePointPolygon, proof: GeoPointInPolygonCircuitProof) {
        super();
        this.geoPoint = geoPoint;
        this._proof = proof;
        this.threePointPolygon = polygon;
    }

    static fromJSON(jsonProof: JsonProof): IO1JSProof {
        return GeoPointInPolygonCircuitProof.fromJSON(jsonProof);
    }

    protected assertVerifyCoordinatesAndPolygonAreTheClaimedOnes(): void {
        /*
            Verify that geoPoint is equal to the one in the proof, and that the polygon is equal to the one in the proof
        */
        const commitment: GeoPointInPolygonCommitment = this.proof.publicOutput;

        const commitmentVeriifier: ZKGeoPointInPolygonCommitment = new ZKGeoPointInPolygonCommitment(this.geoPoint, this.threePointPolygon, commitment);
        commitmentVeriifier.verify();

    }

    verify(): void {
        this.assertVerifyCoordinatesAndPolygonAreTheClaimedOnes();
        super.verify();
    }
}
