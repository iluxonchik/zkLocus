import { Field, JsonProof } from "o1js";
import { ZKLocusProof } from "./ZKLocusProof";
import CachingProofVerificationMiddleware from "./middleware/CachingProofVerificationMiddleware";
import { IO1JSProof } from "./Types";
import type { ZKGeoPoint } from "../models/ZKGeoPoint";
import { MetadataGeoPointCommitment } from "../../model/public/Commitment";
import { ExactGeolocationMetadataCircuit, ExactGeolocationMetadataCircuitProof } from "../../zkprogram/public/Metadata";
import { SHA3_512 } from "../sha3/SHA3";
import { ZKGeoPointProviderCircuitProof } from "./ZKGeoPointProviderCircuitProof";

/**
 * Abstraction over the Zero-Knowledge proof of an exact GeoPoint with associated metadata.
 */
@CachingProofVerificationMiddleware
export class ZKExactGeolocationMetadataCircuitProof extends ZKLocusProof<ExactGeolocationMetadataCircuitProof> {

    protected static _circuit = ExactGeolocationMetadataCircuit;
    protected static _dependentProofs = [
        ZKGeoPointProviderCircuitProof,
    ] 

    constructor(protected _zkGeoPoint: ZKGeoPoint, protected _metadata: string, proof: ExactGeolocationMetadataCircuitProof) {
        super();
        this._proof = proof;
    }
 
    static fromJSON(jsonProof: JsonProof): IO1JSProof {
        return ExactGeolocationMetadataCircuitProof.fromJSON(jsonProof);
    }

    protected assertGeoPointAndMetadataAreTheClaimedOnes(): void {
        const geoPointMetadataCommitment: MetadataGeoPointCommitment = this.proof.publicOutput;
        const geoPointCommitment: Field = geoPointMetadataCommitment.geoPointHash;
        const claimedGeoPointCommitment: Field = this._zkGeoPoint.hash();

        if(!geoPointCommitment.equals(claimedGeoPointCommitment)) {
            throw new Error("The GeoPoint is not the claimed one");
        }

        const metadataCommitment = geoPointMetadataCommitment.metadataHash;
        const clamimedMetadataHash: SHA3_512 = new SHA3_512(this._metadata);
        const claimedMetadataCommitment: Field = clamimedMetadataHash.poseidonHash();

        if(!metadataCommitment.equals(claimedMetadataCommitment)) {
            throw new Error("The metadata is not the claimed one");
        }

    }

    /**
     * Verifies the proof.
     * This operation is not 
     */
    verify(): void {
        super.verify();
        this.assertGeoPointAndMetadataAreTheClaimedOnes();
    }

    /**
     * Gets the zero-knowledge geometric point.
     * Calls the verify method.
     * @returns The zero-knowledge geometric point.
     */
    get zkGeoPoint(): ZKGeoPoint {
        this.verify();
        return this._zkGeoPoint;
    }

    /**
     * Gets the metadata of the ZKExactGeolocationMetadataCircuitProof.
     * @returns The metadata as a string.
     */
    get metadata(): string {
        this.verify();
        return this._metadata;
    }
}