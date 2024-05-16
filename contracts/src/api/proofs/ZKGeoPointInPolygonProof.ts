import { Field, JsonProof, Poseidon } from "o1js";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof, GeoPointInPolygonCombinerCircuit, GeoPointInPolygonCombinerCircuitProof } from "../../zkprogram/private/GeoPointInPolygonCircuit";
import type { ZKThreePointPolygon } from "../models/ZKThreePointPolygon";
import { ZKGeoPoint } from "../models/ZKGeoPoint";
import { GeoPointInPolygonCommitment } from "../../model/private/Commitment";
import { IO1JSProof } from "./Types";
import { ZKLocusProof} from "./ZKLocusProof";
import { ZKProgramCircuit } from "./Types";
import { ZKGeoPointProviderCircuitProof } from "./ZKGeoPointProviderCircuitProof";
import CachingGeoPointInPolygonProofMiddleware from "./middleware/CachingGeoPointInPolygonProofMiddleware";
import type { ICloneableProof } from "./Interfaces";

export type UnverifiedProofDataType = {
    geoPoint: ZKGeoPoint,
    threePointPolygon: ZKThreePointPolygon | undefined,
    isInside: boolean,

    get zkGeoPoint(): ZKGeoPoint;
    get zkPolygon(): ZKThreePointPolygon | undefined;
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
@CachingGeoPointInPolygonProofMiddleware
export class ZKGeoPointInPolygonProof extends ZKLocusProof<GeoPointInPolygonCircuitProof | GeoPointInPolygonCombinerCircuitProof> implements ICloneableProof <ZKGeoPointInPolygonProof>{
    /**
     * The geo point for which the proof is constructed.
    */
    protected geoPoint: ZKGeoPoint;
    
    /**
     * The three-point polygon within which the geo point's presence is being proved. If the proof is a combination of proofs,
     * the polygon is undefined, since the proof represents a combination of multiple polygons.
     * 
     * Not the biggest fan of having an optional attribute here, but it allows to iterate quickly.
    */
    protected threePointPolygon: ZKThreePointPolygon | undefined;
    
    /**
     * Indicates whether the geo point is inside the polygon.
     */
    protected _isInside: boolean;

    protected _leftZKProof: ZKGeoPointInPolygonProof | undefined = undefined;
    protected _rightZKProof: ZKGeoPointInPolygonProof | undefined = undefined;
    protected _operator: GeoPointInPolygonCombinationOperator = GeoPointInPolygonCombinationOperator.NONE;

    get leftZKProof(): ZKGeoPointInPolygonProof | undefined {
        return this._leftZKProof;
    }

    get rightZKProof(): ZKGeoPointInPolygonProof | undefined {
        return this._rightZKProof;
    }

    get operator(): GeoPointInPolygonCombinationOperator {
        return this._operator;
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

    protected static _siblingCircuits = [
        GeoPointInPolygonCombinerCircuit,
    ]

    /**
     * Constructs a ZKGeoPointInPolygonProof instance. It can represent a single proof or a combination of proofs using AND and OR operations.
     * @param geoPoint - The geo point for which the proof is constructed.
     * @param polygon - The polygon within which the geo point's presence is being proved.
     * @param proof - The base proof or the primary proof before combining with others.
     * @param andProofs - (Optional) Array of proofs to be combined with the base proof using the AND operator.
     * @param orProofs - (Optional) Array of proofs to be combined with the base proof using the OR operator.
     */
    constructor({
        geoPoint,
        proof,
        polygon,
        leftProof,
        rightProof,
        operator
    }: {
        geoPoint: ZKGeoPoint,
        proof: GeoPointInPolygonCircuitProof,
        polygon?: ZKThreePointPolygon,
        leftProof?: ZKGeoPointInPolygonProof,
        rightProof?: ZKGeoPointInPolygonProof,
        operator?: GeoPointInPolygonCombinationOperator
    }) {
        super();
        this.geoPoint = geoPoint;
        this._proof = proof;
        this.threePointPolygon = polygon;

        if (polygon === undefined) {
            if (leftProof === undefined || rightProof === undefined) {
                throw new Error('Either the polygon or the left and right proofs must be provided.');
            }
        } else {
            if (leftProof !== undefined || rightProof !== undefined) {
                throw new Error('Either the polygon or the left and right proofs must be provided.');
            }
        }


        const commitment: GeoPointInPolygonCommitment = proof.publicOutput;
        this._isInside = commitment.isInPolygon.toBoolean();

        this._leftZKProof = leftProof;
        this._rightZKProof = rightProof;
        this._operator = operator ?? GeoPointInPolygonCombinationOperator.NONE;

        // TODO: this may be refactored to a more elegant solution. For now, there is a need for a non-intrusive
        // way to access the unverified proof data.
        this.UnverifiedProofData = {
            geoPoint: this.geoPoint,
            threePointPolygon: this.threePointPolygon,
            isInside: this._isInside,

            get zkGeoPoint(): ZKGeoPoint {
                return this.geoPoint;
            },

            get zkPolygon(): ZKThreePointPolygon | undefined {
                return this.threePointPolygon;
            },

            get isGeoPointInsidePolygon(): boolean {
                return this.isInside;
            }
        }
    }

    /**
     * Creates a clone of the ZKGeoPointInPolygonProof instance.
     * 
     * @returns A new instance of ZKGeoPointInPolygonProof with the same values for the minimal necessary attributes.
     * The cloned proof will be considered identical to the original proof.
     */
    clone(): ZKGeoPointInPolygonProof {
        const proof: GeoPointInPolygonCircuitProof = this.proof;
        const leftProof: ZKGeoPointInPolygonProof | undefined = this.leftZKProof;
        const rightProof: ZKGeoPointInPolygonProof | undefined = this.rightZKProof;
        const operator: GeoPointInPolygonCombinationOperator = this.operator;

        const clonedProof: ZKGeoPointInPolygonProof = new ZKGeoPointInPolygonProof({
            geoPoint: this.geoPoint,
            proof: proof,
            polygon: this.threePointPolygon,
            leftProof: leftProof,
            rightProof: rightProof,
            operator: operator
        });
        return clonedProof;
    }

    protected setProof(proof: GeoPointInPolygonCircuitProof): void {
        this._proof = proof;
    }

    public clearCache(): void {
        this.setProof(this.proof);
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
        console.log('In ZKGeoPointInPolygonProof.AND()');
        this.verify();
        other.verify();
        console.log('In ZKGeoPointInPolygonProof.AND() - after verify()');

        const thisProof: GeoPointInPolygonCircuitProof | GeoPointInPolygonCombinerCircuitProof = this.proof;
        const otherProof: GeoPointInPolygonCircuitProof | GeoPointInPolygonCombinerCircuitProof= other.proof;

        // Perform a Zero-Knowledge combination of the two proofs with .AND
        const andProof: GeoPointInPolygonCombinerCircuitProof = await GeoPointInPolygonCombinerCircuit.AND(thisProof, otherProof);
        console.log('In ZKGeoPointInPolygonProof.AND() - after GeoPointInPolygonCombinerCircuit AND()');

        const resultingZKProof: ZKGeoPointInPolygonProof = new ZKGeoPointInPolygonProof({
            geoPoint: this.geoPoint,
            proof: andProof,
            leftProof: this,
            rightProof: other,
            operator: GeoPointInPolygonCombinationOperator.AND
        });

        return resultingZKProof;
    }

    public polygonHash(): Field {
        const polygon: ZKThreePointPolygon | undefined = this.threePointPolygon;

        if (polygon !== undefined) {
            return polygon.hash();
        }

        // Polygon is undefined, meaning it's a combination of proofs
        const leftProof: ZKGeoPointInPolygonProof | undefined = this.leftZKProof;
        const rightProof: ZKGeoPointInPolygonProof | undefined = this.rightZKProof;

        if (leftProof === undefined || rightProof === undefined) {
            throw new Error('[!] INVALID OBJECT STATE: Either the polygon or the left and right proofs must be provided.');
        }

        const leftPolygonHash: Field = leftProof.polygonHash();
        const rightPolygonHash: Field = rightProof.polygonHash();

        return Poseidon.hash([leftPolygonHash, rightPolygonHash]);
    }

    static async fromJSON(jsonProof: JsonProof): Promise<IO1JSProof> {
        return GeoPointInPolygonCircuitProof.fromJSON(jsonProof);
    }

    get zkGeoPoint(): ZKGeoPoint {
        this.verify();
        return this.geoPoint;
    }

    get zkPolygon(): ZKThreePointPolygon | undefined {
        this.verify();
        return this.threePointPolygon;
    }

    get isGeoPointInsidePolygon(): boolean {
        this.verify();
        return this._isInside;
    }

    get polygon(): ZKThreePointPolygon | undefined {
        this.verify();
        return this.threePointPolygon;
    }

    get polygonOrError(): ZKThreePointPolygon {
        this.verify();
        const polygon: ZKThreePointPolygon | undefined = this.threePointPolygon;

        if (polygon === undefined) {
            throw new Error('Polygon is undefined.');
        }

        return polygon;
    }

    /**
     * Asserts that the coordinates and polygon are the claimed ones.
     */
    protected assertVerifyCoordinatesAndPolygonAreTheClaimedOnes(): void {
        
        const commitment: GeoPointInPolygonCommitment = this.proof.publicOutput;

        const commitedPolygonHash: Field = commitment.polygonCommitment;
        const commitedGeoPointHash: Field = commitment.geoPointCommitment;

        const claimedGeoPoint: ZKGeoPoint = this.geoPoint;
        const claimedGeoPointHash: Field = claimedGeoPoint.hash();

        const claimedPolygonHash: Field = this.polygonHash();

        if (!claimedGeoPointHash.equals(commitedGeoPointHash)) {
            throw new Error(`GeoPoint Commitment does not match the claimed one. Claimed: ${claimedGeoPointHash.toString()}. Actual: ${commitedGeoPointHash.toString()}`);
        }

        if (!claimedPolygonHash.equals(commitedPolygonHash)) {
            throw new Error(`Polygon Commitment does not match the claimed one. Claimed: ${claimedPolygonHash.toString()}. Actual: ${commitedPolygonHash.toString()}`);
        }

        if (!claimedPolygonHash.equals(commitedPolygonHash)) {
            throw new Error(`Polygon Commitment does not match the claimed one. Claimed: ${claimedPolygonHash.toString()}. Actual: ${commitedPolygonHash.toString()}`);
        }


    }

    verify(): void {
        this.assertVerifyCoordinatesAndPolygonAreTheClaimedOnes();
        super.verify();
        
        // NOTE: the left and right leaf verification is omitted on purpose. This is not done *FOR NOW* for performance reasons.
        // Strong-ish assertions are done in .assertVerifyCoordinatesAndPolygonAreTheClaimedOnes(). A more robust caching middleware
        // will be implemented in the future, which will allow for a more robust verification of the proofs.
        // The current version of the middlware does not account for verifications done inside of zkLocus Zero-Knowledge ciruits, only
        // at the API level.
        //
        // if (this.leftZKProof !== undefined) {
        //     this.leftZKProof.verify();
        // }
        
        // if (this.rightZKProof !== undefined) {
        //     this.rightZKProof.verify();
        // }


    }

    /**
     * Checks if this ZKGeoPointInPolygonProof is equal to another ZKGeoPointInPolygonProof.
     * @param other The other ZKGeoPointInPolygonProof to compare with.
     * @returns True if the two proofs are equal, false otherwise.
     */
    public isEquals(other: ZKGeoPointInPolygonProof): boolean {
        const thisPolygon: ZKThreePointPolygon | undefined = this.threePointPolygon;
        const otherPolygon: ZKThreePointPolygon | undefined = other.threePointPolygon;

        let isThreePointPolygonEqual: boolean;
        if (thisPolygon !== undefined && otherPolygon !== undefined) {
             isThreePointPolygonEqual = thisPolygon.isEquals(otherPolygon);
        } else {
            isThreePointPolygonEqual = thisPolygon === otherPolygon;
        }

        const isGeoPointEqual: boolean = this.geoPoint.isEquals(other.geoPoint);
        const isLocationEqual: boolean = this._isInside === other._isInside;
        const isPolygonsEqual: boolean = this.polygonHash().equals(other.polygonHash()).toBoolean();


        return isGeoPointEqual && isThreePointPolygonEqual && isLocationEqual && isPolygonsEqual
    }

}
