import { Field, JsonProof, PublicKey, Signature} from "o1js";
import { Bool } from "o1js/dist/node/lib/bool";
import { GeoPointInPolygonCircuitProof } from "../../zkprogram/private/Geography";
import type { ZKGeoPoint, ZKPublicKey, ZKSignature, ZKThreePointPolygon } from "../Models";
import { GeoPointInPolygonCommitment } from "../../model/private/Commitment";
import { GeoPoint, ThreePointPolygon } from "../../model/Geography";
import { IO1JSProof} from "./Types";
import { OracleAuthenticatedGeoPointCommitment } from "../../model/private/Oracle";
import { GeoPointSignatureVerificationCircuitProof } from "../../zkprogram/private/Oracle";


export abstract class ZKCommitment{
    protected commitment: any;
    // TODO: this can be used when verificaiton is turned off? Or maybe use a separate class for that, like VerifiedZKCommitment?
    //protected isVerified: boolean; 
}

/**
 * This class represents a commitment to a ZKGeoPoint being inside or outside a ZKThreePointPolygon.
 * It's an abstraction over the GeoPointInPolygonCommitment class, which is the actual zero-knowledge commitment.
 */
class ZKGeoPointInPolygonCommitment extends ZKCommitment {
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


class ZKOracleAuthenticatedGeoPointCommitment extends ZKCommitment {
    protected commitment: OracleAuthenticatedGeoPointCommitment;
    protected geoPoint: ZKGeoPoint;
    protected publicKey: ZKPublicKey;

    constructor(geoPoint: ZKGeoPoint, publicKey: ZKPublicKey, commitment: OracleAuthenticatedGeoPointCommitment) {
        super();
        this.geoPoint = geoPoint;
        this.publicKey = publicKey;
        this.commitment = commitment;
    }

    /**
     * Verify that the commitment is valid. 
     */
    verify(): void {
        // Oracle commitment data
        const publicKeyHash: Field = this.commitment.publicKeyHash;
        const geoPointHash: Field = this.commitment.geoPointHash;

        // Claimed data
        const claimedPublicKeyHash: Field = this.publicKey.hash();

        const claimedGeoPoint: GeoPoint = this.geoPoint.toZKValue();
        const claimedGeoPointHash: Field = claimedGeoPoint.hash();

        // Verify that the claimed data matches the commitment data
        if (claimedPublicKeyHash !== publicKeyHash) {
            throw new Error(`Public Key Hash does not match the claimed one. Claimed: ${claimedPublicKeyHash.toString()}. Actual: ${publicKeyHash.toString()}`);
        }

        if (claimedGeoPointHash !== geoPointHash) {
            throw new Error(`GeoPoint Hash does not match the claimed one. Claimed: ${claimedGeoPointHash.toString()}. Actual: ${geoPointHash.toString()}`);
        }
    }
}


/*
    This is the parent abstraction class for all zkLocus proofs. Any zkLocus proof is interpertable and abstractble by
    this type. It can load and convert proofs to JSON, combine proofs together, and verify them.

    Internally, it uses the zkLocus API to perform the operations. It also contains properties based on the
    proof structure.
*/
export abstract class ZKLocusProof implements IO1JSProof{
    // TODO: this class is being iteratively defined
    protected proof: IO1JSProof;

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

/**
 * This is a middleware that adds caching to the verification of a proof. It should be used as a decorator on a class that extends ZKLocusProof.
 * @param Base - The base class to extend 
 * @returns A class that extends the base class and adds caching to the verification of the proof 
 */
function CachingProofVerificationMiddleware<T extends new (...args: any[]) => ZKLocusProof>(Base: T) {
    return class extends Base {
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
@CachingProofVerificationMiddleware
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

@CachingProofVerificationMiddleware
export class ZKGeoPointSignatureVerificationCircuitProof extends ZKLocusProof {
    protected proof: GeoPointSignatureVerificationCircuitProof;

    constructor(protected zkPublicKey: ZKPublicKey, protected zkSignature: ZKSignature, protected zkGeoPoint: ZKGeoPoint, proof: GeoPointSignatureVerificationCircuitProof) {
        super();
        this.proof = proof;
    }

    static fromJSON(jsonProof: JsonProof): IO1JSProof {
        return GeoPointSignatureVerificationCircuitProof.fromJSON(jsonProof);
    }

    /**
     * Verify that the commitment output by the zero-knowlede circuit matches the claimed GeoPoint and PublicKey.
     */
    assertGeoPointIsTheClaimedOne(): void {
        const commitment: OracleAuthenticatedGeoPointCommitment = this.proof.publicOutput;
        const commitmentVerifier: ZKOracleAuthenticatedGeoPointCommitment = new ZKOracleAuthenticatedGeoPointCommitment(this.zkGeoPoint, this.zkPublicKey, commitment);
        commitmentVerifier.verify();
    }

    verify(): void {
        super.verify();
        this.assertGeoPointIsTheClaimedOne();
    }

    verifyIf(condition: Bool): void {
        if (condition) {
            this.verify();
        }
    }

    /**
     * The geopoint that was signed by the Oracle.
     */
    get geoPoint(): ZKGeoPoint {
        this.verify();
        return this.zkGeoPoint;
    }

    toJSON(): JsonProof {
        return this.proof.toJSON();
    }

}
