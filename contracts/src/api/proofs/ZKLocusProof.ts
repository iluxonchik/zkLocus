import { Field, JsonProof, Poseidon, ZkProgram } from "o1js";
import { Bool } from "o1js/dist/node/lib/bool";
import { GeoPointInPolygonCircuitProof } from "../../zkprogram/private/Geography";
import { ZKGeoPoint, ZKThreePointPolygon } from "../Models";
import { GeoPointInPolygonCommitment } from "../../model/private/Commitment";
import { GeoPoint, ThreePointPolygon } from "../../model/Geography";
import { IO1JSProof, IO1JSProofConstructor } from "./Types";


export abstract class ZKCommitment{
    protected commitment: any;
    // TODO: this can be used when verificaiton is turned off? Or maybe use a separate class for that, like VerifiedZKCommitment?
    //protected isVerified: boolean; 
}

class ZKGeoPointInPolygonCommitment extends ZKCommitment {
    /**
     * 
     */

    protected commitment: GeoPointInPolygonCommitment;
    protected geoPoint: ZKGeoPoint;
    protected polygon: ZKThreePointPolygon;

    constructor(geoPoint: ZKGeoPoint, polygon: ZKThreePointPolygon, commitment: GeoPointInPolygonCommitment) {
        super();
        this.geoPoint = geoPoint;
        this.polygon = polygon;
        this.commitment = commitment;
    }

    verify(): void {
        const polygonCommitment: Field = this.commitment.polygonCommitment;
        const geoPointCommitment: Field = this.commitment.geoPointCommitment;

        const claimedPolygon: ThreePointPolygon = this.polygon.toZKValue();
        const claimedGeoPoint: GeoPoint = this.geoPoint.toZKValue();
        
        const claimedPolygonCommitment: Field = claimedPolygon.hash();
        const claimedGeoPointCommitment: Field = claimedGeoPoint.hash();

        if (claimedPolygonCommitment !== polygonCommitment) {
            throw new Error(`Polygon Commitment does not match the claimed one. Claimed: ${claimedPolygonCommitment.toString()}. Actual: ${polygonCommitment.toString()}`);
        }

        if (claimedGeoPointCommitment !== geoPointCommitment) {
            throw new Error(`GeoPoint Commitment does not match the claimed one. Claimed: ${claimedGeoPointCommitment.toString()}. Actual: ${geoPointCommitment.toString()}`);
        }
    }
}


interface IProofState {
    verify(context: ZKGeoPointInPolygonProof): void;
    verifyIf(context: ZKGeoPointInPolygonProof, condition: Bool): void;
}




/*
    This is the parent abstraction class for all zkLocus proofs. Any zkLocus proof is interpertable and abstractble by
    this type. It can load and convert proofs to JSON, combine proofs together, and verify them.

    Internally, it uses the zkLocus API to perform the operations. It also contains properties based on the
    proof structure.
*/
export abstract class ZKLocusProof implements IO1JSProof {
    // TODO: this class is being iteratively defined
    protected abstract proof: IO1JSProof;

    verify(): void {
        return this.proof.verify();
    }

    verifyIf(condition: Bool): void {
        return this.proof.verifyIf(condition);
    }

    toJSON(): JsonProof {
        return this.proof.toJSON();
    }
    
}

function ZKGeoPointInPolygonProofVerificationMiddleware(constructor: typeof ZKGeoPointInPolygonProof) {
    return class extends constructor {
        private isVerified = false;

        verify() {
            if (!this.isVerified) {
                super.verify();
                this.isVerified = true;
            }
        }

        verifyIf(condition: Bool) {
            if (!this.isVerified && condition) {
                super.verify();
                this.isVerified = true;
            }
        }
    }
}

/**
 * This class represents a proof that a ZKGeoPoint is inside a ZKThreePointPolygon.
 * A 
 */
@ZKGeoPointInPolygonProofVerificationMiddleware
export class ZKGeoPointInPolygonProof extends ZKLocusProof {

    protected proof: GeoPointInPolygonCircuitProof;
    protected geoPoint: ZKGeoPoint;
    protected threePointPolygon: ZKThreePointPolygon;

    constructor(geoPoint: ZKGeoPoint, polygon: ZKThreePointPolygon, proof: GeoPointInPolygonCircuitProof){
        super();
        this.geoPoint = geoPoint;
        this.proof = proof;
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