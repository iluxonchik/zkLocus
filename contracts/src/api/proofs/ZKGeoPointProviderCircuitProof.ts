import { JsonProof } from "o1js";
import { GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";
import { IO1JSProof } from "./Types";
import { ZKLocusProof } from "./ZKLocusProof";
import { GeoPoint } from "../../model/Geography";
import { ZKGeoPoint } from "../Models";
import CachingProofVerificationMiddleware from "./middleware/CachingProofVerificationMiddleware";

@CachingProofVerificationMiddleware
export class ZKGeoPointProviderCircuitProof extends ZKLocusProof {
    protected proof: GeoPointProviderCircuitProof;

    constructor(proof: GeoPointProviderCircuitProof) {
        super();
        this.proof = proof;
    }

    static fromJSON(jsonProof: JsonProof): IO1JSProof {
        return GeoPointProviderCircuitProof.fromJSON(jsonProof);
    }

    get zkGeoPoint(): ZKGeoPoint {
        this.verify();
        const geoPoint:GeoPoint = this.proof.publicOutput;
        return ZKGeoPoint.fromGeoPoint(geoPoint);
    }
}