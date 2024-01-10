import { JsonProof } from "o1js";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof } from "../../zkprogram/private/Geography";
import type { ZKThreePointPolygon } from "../models/ZKThreePointPolygon";
import { ZKGeoPoint } from "../models/ZKGeoPoint";
import { GeoPointInPolygonCommitment } from "../../model/private/Commitment";
import { IO1JSProof } from "./Types";
import CachingProofVerificationMiddleware from "./middleware/CachingProofVerificationMiddleware";
import { ZKLocusProof, ZKGeoPointInPolygonCommitment } from "./ZKLocusProof";
import { ZKProgramCircuit } from "./Types";
import { ZKGeoPointProviderCircuitProof } from "./ZKGeoPointProviderCircuitProof";


export type UnverifiedProofDataType = {
    geoPoint: ZKGeoPoint,
    threePointPolygon: ZKThreePointPolygon,
    isInside: boolean,

    get zkGeoPoint(): ZKGeoPoint;
    get zkPolygon(): ZKThreePointPolygon;
    get isGeoPointInsidePolygon(): boolean;
}

export enum GeoPointInPolygonCombinationOperator {
    NONE = 'NONE', // base case, meaning no combination operator applied
    AND = 'AND',
    OR = 'OR',
}


export type CombinedPolygonProof = {
    operator: GeoPointInPolygonCombinationOperator,
    proof: GeoPointInPolygonCircuitProof,
    polygon: ZKThreePointPolygon,

}

/**
 * Represents a proof that a ZKGeoPoint is inside a ZKThreePointPolygon in a zero-knowledge circuit.
 * This class allows representation of both a single Point In Polygon Proof, and a combination of such proofs
 * using logical AND and OR operators. It encapsulates the logic for combining and verifying these proofs.
 */
@CachingProofVerificationMiddleware
export class ZKGeoPointInPolygonProof extends ZKLocusProof<GeoPointInPolygonCircuitProof> {
    /**
     * The geo point for which the proof is constructed.
    */
    protected geoPoint: ZKGeoPoint;
    
    /**
     * The three-point polygon within which the geo point's presence is being proved.
    */
    protected threePointPolygon: ZKThreePointPolygon;
    
    /**
     * Indicates whether the geo point is inside the polygon.
     */
    protected _isInside: boolean;

    /**
     * The base proof in the sequence of combined proofs. It is the first proof if this instance is a combination
     * of multiple proofs using .AND() or .OR() methods.
     * 
     * @type {GeoPointInPolygonCircuitProof}
     * @private
     * @memberof ZKGeoPointInPolygonProof 
    */
    protected _baseProof: ZKGeoPointInPolygonProof | undefined = undefined;
    
    /**
     * An array of proofs that are combined with this proof using the .AND() method.
     */
    protected _andProofs: ZKGeoPointInPolygonProof[] = [];
   
    /**
     * An array of proofs that are combined with this proof using the .OR() method.
     */
    protected _orProofs: ZKGeoPointInPolygonProof[] = [];

    /**
     * Get the base proof of this instance of ZKGeoPointInPolygonProof. 
     * The base proof is considered to be the first proof in the sequence of proofs combined by .AND() and .OR() methods.
     * If this instance of ZKGeoPointInPolygonProof has not been combined with any other proofs, then the base proof is 
     * this instance of ZKGeoPointInPolygonProof. Such a logic extends the recursive nature of the recursive zkSNARKs 
     * implemenation of the underlying Zero-Knowledge circuits of zkLocus.
     * @returns {ZKGeoPointInPolygonProof} The base proof.
     */
    public get baseProof(): ZKGeoPointInPolygonProof {
        if (this._baseProof === undefined) {
            return this;
        } else {
            return this._baseProof;
        }
    }

    /**
     * Getter for the array of proofs combined using the AND operator.
     * @returns An array of proofs combined with the AND operator.
     */
    public get andProofs(): ZKGeoPointInPolygonProof[] {
        return this._andProofs;
    }

    /**
     * Get the proofs combined by the .OR() method.
     * @returns {ZKGeoPointInPolygonProof[]} The proofs combined by the .OR() method.
     */
    public get orProofs(): ZKGeoPointInPolygonProof[] {
        return this._orProofs;
    }

    /**
     * Provides access to the unverified data used in the proof. This includes the geo point, the polygon, and the result
     * of whether the geo point is inside the polygon.
     */
    public readonly UnverifiedProofData: UnverifiedProofDataType;

    /**
     * The Zero-Knowledge O1JS circuit used for the point in polygon proof.
     */
    protected static _circuit: ZKProgramCircuit = GeoPointInPolygonCircuit;

    /**
     * An array of dependent proofs required by this proof.
     */
    protected static _dependentProofs = [
        ZKGeoPointProviderCircuitProof,
    ];

    /**
     * Constructs a ZKGeoPointInPolygonProof instance. It can represent a single proof or a combination of proofs using AND and OR operations.
     * @param geoPoint - The geo point for which the proof is constructed.
     * @param polygon - The polygon within which the geo point's presence is being proved.
     * @param proof - The base proof or the primary proof before combining with others.
     * @param andProofs - (Optional) Array of proofs to be combined with the base proof using the AND operator.
     * @param orProofs - (Optional) Array of proofs to be combined with the base proof using the OR operator.
     */
    constructor(geoPoint: ZKGeoPoint, polygon: ZKThreePointPolygon, proof: GeoPointInPolygonCircuitProof, andProofs: ZKGeoPointInPolygonProof[] | undefined = undefined, orProofs: ZKGeoPointInPolygonProof[] | undefined = undefined) {
        super();
        this.geoPoint = geoPoint;
        this._proof = proof;
        this.threePointPolygon = polygon;
        const commitment: GeoPointInPolygonCommitment = proof.publicOutput;
        this._isInside = commitment.isInPolygon.toBoolean();

        if (andProofs) {
            this._andProofs = andProofs;
        }

        if (orProofs) {
            this._orProofs = orProofs;
        }

        // TODO: this may be refactored to a more elegant solution. For now, there is a need for a non-intrusive
        // way to access the unverified proof data.
        this.UnverifiedProofData = {
            geoPoint: this.geoPoint,
            threePointPolygon: this.threePointPolygon,
            isInside: this._isInside,

            get zkGeoPoint(): ZKGeoPoint {
                return this.geoPoint;
            },

            get zkPolygon(): ZKThreePointPolygon {
                return this.threePointPolygon;
            },

            get isGeoPointInsidePolygon(): boolean {
                return this.isInside;
            }
        }
    }

    protected setProof(proof: GeoPointInPolygonCircuitProof): void {
        this._proof = proof;
    }

    protected setBaseProof(baseProof: ZKGeoPointInPolygonProof): void {
        this._baseProof = baseProof;
    }


    // this method bypasses the proving step, as it expects to receive the ready proofs alrady
    static fromCombinedPolygonProofs(geoPoint: ZKGeoPoint, proof: GeoPointInPolygonCircuitProof, polygonProofs: CombinedPolygonProof[]): ZKGeoPointInPolygonProof {
        // 1. Identify the base polygon/initial polygon/with NONE operator. This is the polygon that is used as the base for the combination.
        // 1.1 If there is no base polygon, throw an error.
        // 1.2 If there is more than one base polygon, throw an error.
        
        const basePolygonProofs = polygonProofs.filter((polygonProof) => polygonProof.operator === GeoPointInPolygonCombinationOperator.NONE);
        
        if (basePolygonProofs.length === 0) {
            throw new Error('There is no base polygon in the provided polygon proofs.');
        }
        
        if (basePolygonProofs.length > 1) {
            throw new Error('There is more than one base polygon in the provided polygon proofs.');
        }

        const basePolygonProof: CombinedPolygonProof = basePolygonProofs[0];
        const andPolygonProofs: CombinedPolygonProof[] = polygonProofs.filter((polygonProof) => polygonProof.operator === GeoPointInPolygonCombinationOperator.AND);
        const orPolygonProofs: CombinedPolygonProof[] = polygonProofs.filter((polygonProof) => polygonProof.operator === GeoPointInPolygonCombinationOperator.OR);

        const zkAndPolygonProofs: ZKGeoPointInPolygonProof[] = andPolygonProofs.map((polygonProof) => new ZKGeoPointInPolygonProof(geoPoint, polygonProof.polygon, polygonProof.proof));
        const zkOrPolygonProofs: ZKGeoPointInPolygonProof[] = orPolygonProofs.map((polygonProof) => new ZKGeoPointInPolygonProof(geoPoint, polygonProof.polygon, polygonProof.proof));

        const zkCombinedPolygonProof: ZKGeoPointInPolygonProof = new ZKGeoPointInPolygonProof(geoPoint, basePolygonProof.polygon, basePolygonProof.proof, zkAndPolygonProofs, zkOrPolygonProofs);

        return zkCombinedPolygonProof;

    }

    /**
     * Performs a Zero-Knowledge AND operation between two ZKGeoPointInPolygonProof instances.
     * This is a zkLocus roll-up operations, which compresses two proofs into a single proof.
     * This enabled the creation of an application chain for zkLocus.
     * 
     * @param other - The other ZKGeoPointInPolygonProof instance to perform the AND operation with.
     * @returns A new ZKGeoPointInPolygonProof instance representing the combination of the two proofs.
     */
    async AND(other: ZKGeoPointInPolygonProof): Promise<ZKGeoPointInPolygonProof> {
        this.verify();
        other.verify();

        const thisProof: GeoPointInPolygonCircuitProof = this.proof;
        const thisProofClone: ZKGeoPointInPolygonProof = new ZKGeoPointInPolygonProof(this.geoPoint, this.threePointPolygon, thisProof);

        const otherProof: GeoPointInPolygonCircuitProof = other.proof;
        const otherZkProof: ZKGeoPointInPolygonProof = new ZKGeoPointInPolygonProof(other.geoPoint, other.threePointPolygon, otherProof);

        // Perform a Zero-Knowledge combination of the two proofs with .AND
        const andProof: GeoPointInPolygonCircuitProof = await GeoPointInPolygonCircuit.AND(thisProof, otherProof);
        this._andProofs.push(otherZkProof); // add the other proof to the list of AND proofs

        // update the Zero-Knowledge proof of this instance of ZKGeoPointInPolygonProof. This instances 
        // now represents a combination of the two proofswith the .AND operator, as such the "final recursive proof" 
        // and is public output must be updated.
        this.setProof(andProof);
        this.setBaseProof(thisProofClone)

        return this;
    }

    static fromJSON(jsonProof: JsonProof): IO1JSProof {
        return GeoPointInPolygonCircuitProof.fromJSON(jsonProof);
    }

    get zkGeoPoint(): ZKGeoPoint {
        this.verify();
        return this.geoPoint;
    }

    get zkPolygon(): ZKThreePointPolygon {
        this.verify();
        return this.threePointPolygon;
    }

    get isGeoPointInsidePolygon(): boolean {
        this.verify();
        return this._isInside;
    }

    get allZKProofs(): ZKGeoPointInPolygonProof[] {
        this.verify();
        const allPolygonProofs: ZKGeoPointInPolygonProof[] = [this];
        allPolygonProofs.push(...this._andProofs);
        allPolygonProofs.push(...this._orProofs);
        return allPolygonProofs;
    }
    
    get allPolygons(): ZKThreePointPolygon[] {
        this.verify();
        const zkProofs: ZKGeoPointInPolygonProof[] = this.allZKProofs;
        const polygons: ZKThreePointPolygon[] = zkProofs.map((zkProof) => zkProof.zkPolygon);

        return polygons;
    }

    /**
     * Asserts that the coordinates and polygon are the claimed ones.
     */
    protected assertVerifyCoordinatesAndPolygonAreTheClaimedOnes(): void {
        
        const commitment: GeoPointInPolygonCommitment = this.proof.publicOutput;
        const allPolygons: ZKThreePointPolygon[] = this.allPolygons;

        const commitmentVeriifier: ZKGeoPointInPolygonCommitment = new ZKGeoPointInPolygonCommitment(this.geoPoint, allPolygons, this._isInside, commitment);
        commitmentVeriifier.verify();
    }

    verify(): void {
        this.assertVerifyCoordinatesAndPolygonAreTheClaimedOnes();
        super.verify();
    }
}
