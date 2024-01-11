import type { PublicKey, Signature } from "o1js";
import type { ZKSignature } from "../models/ZKSignature";
import type { ZKPublicKey } from "../models/ZKPublicKey";
import type { ZKThreePointPolygon } from "../models/ZKThreePointPolygon";
import type { GeoPoint } from "../../model/Geography";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof, GeoPointProviderCircuit, GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";
import type{ ZKExactGeoPointCircuitProof } from "../proofs/ZKExactGeoPointCircuitProof";
import type { ZKGeoPointInPolygonProof } from "../proofs/ZKGeoPointInPolygonProof";
import type { ZKGeoPointProviderCircuitProof } from "../proofs/ZKGeoPointProviderCircuitProof";
import { OracleGeoPointProviderCircuitProof, OracleGeoPointProviderCircuit } from "../../zkprogram/private/Oracle";
import { ExactGeoPointCircuit, ExactGeoPointCircuitProof } from "../../zkprogram/public/ExactGeoPointCircuit";
import type { ZKExactGeolocationMetadataCircuitProof } from "../proofs/ZKExactGeolocationMetadataCircuitProof";
import { ExactGeolocationMetadataCircuit, ExactGeolocationMetadataCircuitProof } from "../../zkprogram/public/Metadata";
import { Bytes64, SHA3_512 } from "../sha3/SHA3";
import { ZKGeoPointConstructor, IZKGeoPointProver } from "./IZKGeoPointProver";
import type { ZKGeoPointInOrOutOfPolygonCircuitProof } from "../proofs/ZKGeoPointInOrOutOfPolygonCircuitProof";
import { GeoPointInOrOutOfPolygonCircuit, GeoPointInOrOutOfPolygonCircuitProof } from "../../zkprogram/private/GeoPointInOrOutOfPolygonCircuit";

type PolygonProofs = {
  insidePolygonProofs: ZKGeoPointInPolygonProof[];
  outsidePolygonProofs: ZKGeoPointInPolygonProof[];
};


/**
 * Enhances a ZKGeoPoint with methods for generating zero-knowledge proofs.
 * @param Base - The ZKGeoPoint class to be augmented.
 * @returns An augmented class with additional zero-knowledge proof capabilities.
 */

export default function <T extends ZKGeoPointConstructor>(Base: T) {
    return class extends Base implements IZKGeoPointProver {
        /**
         * The proof that the point is authenticated by an Integration Oracle. This is set by the authenticateFromIntegrationOracle method.
         * If this is null, then the point has not been authenticated by an Integration Oracle. Once the method is called, this will be set.
         */
        private integrationOracleProof: ZKGeoPointProviderCircuitProof | null = null;

        /**
         * The proof that the point is authenticated by an Integration Oracle and has associated metadata. This is set by the attachMetadata method.
         * If this is null, then the point has not been authenticated by an Integration Oracle and has no associated metadata. Once the method is called, this will be set.
         */
        private exactGeolocationMetadataProof: ZKExactGeolocationMetadataCircuitProof | null = null;

        private inPolygonProof: PolygonProofs = {
            insidePolygonProofs: [],
            outsidePolygonProofs: [],
        };



        getIntegrationOracleProofOrError(): ZKGeoPointProviderCircuitProof {
            if (this.integrationOracleProof === null) {
                throw new Error("Integration Oracle proof is not available. Please call authenticateFromIntegrationOracle first.");
            }
            return this.integrationOracleProof;
        }

        Prove = {
            /**
             * Generates a proof that this point is within a specified polygon.
             * @param polygon - The polygon within which the point's presence is to be proven.
             * @returns A promise that resolves to a zero-knowledge proof of the point's presence within the polygon.
             */
            inPolygon: async (polygon: ZKThreePointPolygon): Promise<ZKGeoPointInPolygonProof> => {
                const geoPointProof: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(this.toZKValue());
                const geoPointInPolygonProof: GeoPointInPolygonCircuitProof = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(geoPointProof, polygon.toZKValue());

                const { ZKGeoPointInPolygonProof } = await import("../proofs/ZKGeoPointInPolygonProof");
                const zkPointInPolygonProof: ZKGeoPointInPolygonProof = new ZKGeoPointInPolygonProof(this, polygon, geoPointInPolygonProof);
                
                // record the proof in the appropriate collection, depending on whether the ZKGeoPoint is inside or outside the polygon
                if (zkPointInPolygonProof.UnverifiedProofData.isInside) {
                    this.inPolygonProof.insidePolygonProofs.push(zkPointInPolygonProof);
                } else {
                    this.inPolygonProof.outsidePolygonProofs.push(zkPointInPolygonProof);
                }
                return zkPointInPolygonProof;
            },

            inPolygons: async(polygons: ZKThreePointPolygon[]): Promise<ZKGeoPointInPolygonProof[]> => {
                if (polygons.length === 0) {
                    throw new Error("'polygons' must contain at least one polygon.")
                }

                const { ZKGeoPointInPolygonProof } = await import("../proofs/ZKGeoPointInPolygonProof");
                const proofs: ZKGeoPointInPolygonProof[] = []; 
                for (const polygon of polygons) {
                    const proof: ZKGeoPointInPolygonProof = await this.Prove.inPolygon(polygon);
                    proofs.push(proof);
                }

                return proofs;

            },
            /**
             * Authenticates the ZKGeoPoint using a signature from an Integration Oracle.
             * @param publicKey - The public key corresponding to the Oracle's signature.
             * @param signature - The signature provided by the Integration Oracle.
             * @returns A promise that resolves to a circuit proof of the point's authentication via the Oracle.
            */
            authenticateFromIntegrationOracle: async (publicKey: ZKPublicKey, signature: ZKSignature): Promise<ZKGeoPointProviderCircuitProof> => {
                const plainPublicKey: PublicKey = publicKey.toZKValue();
                const plainGeoPoint: GeoPoint = this.toZKValue();
                const plainSignature: Signature = signature.toZKValue();
                const oracleSignatureVerificationProof: OracleGeoPointProviderCircuitProof = await OracleGeoPointProviderCircuit.fromSignature(
                    plainPublicKey,
                    plainSignature,
                    plainGeoPoint
                );

                const oracleGeoPointProviderProof: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromOracle(
                    oracleSignatureVerificationProof,
                    plainGeoPoint
                );
                
                const { ZKGeoPointProviderCircuitProof } = await import("../proofs/ZKGeoPointProviderCircuitProof");
                this.integrationOracleProof = new ZKGeoPointProviderCircuitProof(oracleGeoPointProviderProof);
                return this.integrationOracleProof;
            },
            /**
            * Generates a zero-knowledge proof of the exact geographical location of the ZKGeoPoint.
            * The behavior changes based on the authentication sources that have been used.
            * @returns A promise that resolves to a zero-knowledge proof of the exact location.
            */
            exactGeoPoint: async (): Promise<ZKExactGeoPointCircuitProof> => {
                // Conditional logic based on the set of authentication sources
                if (this.integrationOracleProof === null) {
                    //  TODO: temporary unil we support multiple authentication sources. Let's fail instead of having undefined behaviour with possible security violations
                    throw new Error("Currently, ExactGeoPoint can only be generated for a ZKGeoPoint that has been authenticated from exactly one source. This will be supported in the future.");
                }

                if (this.integrationOracleProof !== null) {
                    return this.exactGeoPointForIntegrationOracle();
                } else {
                    throw new Error("Unsupported or unknown authentication source(s) for exactGeoPoint.");
                }
            },

            /**
             * Attaches metadata to the ZKGeoPoint. This is only supported for ZKGeoPoints that have been obtained in a supported manner, such
             * as being provided by an Integration Oracle circuit.
             *
             * Metadata is attached to the GeoPoint in the following manner:
             * 1. [Non-Verifiable] The metadata is hashed using SHA3-512
             * 2. [Non-Verifiable] The hash is converted into a Field-compatible representation, by using `Bytes64`
             * 3. [Verifiable] The converted hash is provided as ap private intput to the Zero-Knowledge circuit that will attach it to/commit to a GeoPoint
             * 4. [Verifiable] The converted hash is hashed again using Poseidon and that value is cyrpotgraphically committed to the GeoPoint.
             *
             * Given that a cryptographic commitment is created to a commitment to metadata, a cryptographic commitment is created to the metadata itself.
             *
             * As such, attaching an arbitrary string of metadata involves hashing that metadata using SHA3-512, providing that hash to a Zero-Knowledge circuit in
             * a verifiable manner, and then hashing that hash again inside the circuit using Poseidon, thus committing to it in a verifiable manner.
             * @param metadata - The metadata to attach to the ZKGeoPoint.
             * @returns A promise that resolves to a zero-knowledge proof of the exact location and metadata.
             */
            attachMetadata: async (metadata: string): Promise<ZKExactGeolocationMetadataCircuitProof> => {
                if (this.integrationOracleProof === null) {
                    throw new Error("In order to attach metadata to a ZKGeoPoint, it must be authenticated from an Integration Oracle. Currently, this is the only supported authentication source, but will be expanded in the future.");
                }
                const sha3_512: SHA3_512 = new SHA3_512(metadata);
                const sha3_512_digest: Bytes64 = sha3_512.digest;
                const exactGeolocationMetadataProof: ExactGeolocationMetadataCircuitProof = await ExactGeolocationMetadataCircuit.attachMetadataToGeoPoint(this.integrationOracleProof.proof, sha3_512_digest);
                
                const { ZKExactGeolocationMetadataCircuitProof } = await import("../proofs/ZKExactGeolocationMetadataCircuitProof");
                this.exactGeolocationMetadataProof = new ZKExactGeolocationMetadataCircuitProof(this, metadata, exactGeolocationMetadataProof);

                return this.exactGeolocationMetadataProof;
            },

            combinePointInPolygonProofs: async (): Promise<ZKGeoPointInOrOutOfPolygonCircuitProof> => {
                if (this.inPolygonProof.insidePolygonProofs.length === 0) {
                    throw new Error("Cannot combine proofs for a ZKGeoPoint that has not been proven to be inside of any polygons. It's requied to have both, inside and outside polygon proofs. If you only have one set, you can combine them together with .AND and/or .OR methods.");
                }

                if (this.inPolygonProof.outsidePolygonProofs.length === 0) {
                    throw new Error("Cannot combine proofs for a ZKGeoPoint that has not been proven to be outside of any polygons. It's requied to have both, inside and outside polygon proofs. If you only have one set, you can combine them together with .AND and/or .OR methods.");
                }

                const insidePolygonProofs: ZKGeoPointInPolygonProof[] = this.inPolygonProof.insidePolygonProofs;
                const outsidePolygonProofs: ZKGeoPointInPolygonProof[] = this.inPolygonProof.outsidePolygonProofs;
                
                const firstInsidePolygonProof: ZKGeoPointInPolygonProof = insidePolygonProofs[0];
                const firstOutsidePolygonProof: ZKGeoPointInPolygonProof = outsidePolygonProofs[0];

                for (const insidePolygonProof of insidePolygonProofs.slice(1)) {
                    await firstInsidePolygonProof.AND(insidePolygonProof);
                }

                for (const outsidePolygonProof of outsidePolygonProofs.slice(1)) {
                    await firstOutsidePolygonProof.AND(outsidePolygonProof);
                }

                const insidePolygonProofRaw: GeoPointInPolygonCircuitProof = firstInsidePolygonProof.proof;
                const outsidePolygonProofRaw: GeoPointInPolygonCircuitProof = firstOutsidePolygonProof.proof;

                const proof: GeoPointInOrOutOfPolygonCircuitProof = await GeoPointInOrOutOfPolygonCircuit.fromPointInPolygonProofs(insidePolygonProofRaw, outsidePolygonProofRaw);
                
                const { ZKGeoPointInOrOutOfPolygonCircuitProof } = await import("../proofs/ZKGeoPointInOrOutOfPolygonCircuitProof");
                const zkProof: ZKGeoPointInOrOutOfPolygonCircuitProof = new ZKGeoPointInOrOutOfPolygonCircuitProof(this, proof);
                return zkProof;

            }

        };

        private async exactGeoPointForIntegrationOracle(): Promise<ZKExactGeoPointCircuitProof> {
            const oracleProof: ZKGeoPointProviderCircuitProof = this.getIntegrationOracleProofOrError();
            const rawProof: GeoPointProviderCircuitProof = oracleProof.proof;
            

            const rawExactGeoPointProof: ExactGeoPointCircuitProof = await ExactGeoPointCircuit.fromGeoPointProvider(
                rawProof
            );
            const { ZKExactGeoPointCircuitProof } = await import("../proofs/ZKExactGeoPointCircuitProof");
            const zkExactGeoPointProof: ZKExactGeoPointCircuitProof = new ZKExactGeoPointCircuitProof(this, rawExactGeoPointProof);
            return zkExactGeoPointProof;
        }
 
    };
}
