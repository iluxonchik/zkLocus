import { Field, JsonProof } from "o1js";
import { ExactGeoPointCircuitProof } from "../../zkprogram/public/GeoPoint";
import { ZKLocusProof } from "./ZKLocusProof";
import CachingProofVerificationMiddleware from "./middleware/CachingProofVerificationMiddleware";
import { IO1JSProof } from "./Types";
import { ZKGeoPoint } from "../Models";
import { GeoPointCommitment } from "../../model/public/Commitment";

@CachingProofVerificationMiddleware
export class ZKExactGeoPointCircuitProof extends ZKLocusProof {
    protected proof: ExactGeoPointCircuitProof;
    protected claimedZKGeoPoint: ZKGeoPoint;

    constructor(zkGeoPoint: ZKGeoPoint, proof: ExactGeoPointCircuitProof) {
        super();
        this.proof = proof;
        this.claimedZKGeoPoint = zkGeoPoint;
    }

    static fromJSON(jsonProof: JsonProof): IO1JSProof {
        return ExactGeoPointCircuitProof.fromJSON(jsonProof);
    }

    assertGeoPointIsTheClaimedOne(): void {
        this.verify();
        const geoPointCommitment: GeoPointCommitment = this.proof.publicOutput;
        const claimedGeoPointCommitment: Field = this.claimedZKGeoPoint.hash();

        if(geoPointCommitment.geoPointHash !== claimedGeoPointCommitment) {
            throw new Error("The GeoPoint is not the claimed one");
        }
    }

    verify(): void {
        super.verify();
        this.assertGeoPointIsTheClaimedOne();
    }

    get zkGeoPoint(): ZKGeoPoint {
        this.verify();
        return this.zkGeoPoint;
    }
        
}