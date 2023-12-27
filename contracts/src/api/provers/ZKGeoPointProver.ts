import type { ZKGeoPoint, ZKPublicKey, ZKSignature, ZKThreePointPolygon } from "../Models";
import { IZKProver } from "./Interfaces";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof, GeoPointProviderCircuit, GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";
import { ZKGeoPointInPolygonProof, ZKGeoPointSignatureVerificationCircuitProof, ZKLocusProof } from "../proofs/ZKLocusProof";
import { PublicKey, Signature } from "o1js";
import { GeoPointSignatureVerificationCircuitProof, OracleGeoPointProviderCircuit } from "../../zkprogram/private/Oracle";
import { GeoPoint } from "../../model/Geography";
import { ZKExactGeoPointCircuitProof } from "../proofs/ZKExactGeoPointCircuitProof";
import { ExactGeoPointCircuit, ExactGeoPointCircuitProof } from "../../zkprogram/public/ExactGeoPointCircuit";
import { ZKGeoPointProviderCircuitProof } from "../proofs/ZKGeoPointProviderCircuitProof";

export type ZKGeoPointConstructor = new (...args: any[]) => ZKGeoPoint;

export interface IZKGeoPointProver extends IZKProver {

    Prove: {
        inPolygon: (polygon: ZKThreePointPolygon) => Promise<ZKLocusProof<any>>;


        authenticateFromIntegrationOracle: (publicKey: ZKPublicKey, signature: ZKSignature) => Promise<ZKGeoPointProviderCircuitProof>;
        exactGeoPoint: () => Promise<ZKExactGeoPointCircuitProof>;
    };
}

/**
 * Enhances a ZKGeoPoint with methods for generating zero-knowledge proofs.
 * @param Base - The ZKGeoPoint class to be augmented.
 * @returns An augmented class with additional zero-knowledge proof capabilities.
 */
export default function <T extends ZKGeoPointConstructor>(Base: T) {
    return class extends Base implements IZKGeoPointProver {
        /**
        * Set of authentication sources that have been used for this ZKGeoPoint instance.
        */
        private integrationOracleProof: ZKGeoPointProviderCircuitProof | null = null;

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
                const geoPointInPolygonProof: GeoPointInPolygonCircuitProof = await GeoPointInPolygonCircuit.proveProvidedGeoPointIn3PointPolygon(geoPointProof, polygon.toZKValue());
                return new ZKGeoPointInPolygonProof(this, polygon, geoPointInPolygonProof);
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
                const oracleSignatureVerificationProof: GeoPointSignatureVerificationCircuitProof = await OracleGeoPointProviderCircuit.fromSignature(
                    plainPublicKey,
                    plainSignature,
                    plainGeoPoint
                );

                const oracleGeoPointProviderProof: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromOracle(
                    oracleSignatureVerificationProof,
                    plainGeoPoint,
                )

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
        }

        private async exactGeoPointForIntegrationOracle(): Promise<ZKExactGeoPointCircuitProof> {
            const oracleProof: ZKGeoPointProviderCircuitProof = this.getIntegrationOracleProofOrError();
            const rawProof: GeoPointProviderCircuitProof = oracleProof.zkProof;

            const rawExactGeoPointProof: ExactGeoPointCircuitProof = await ExactGeoPointCircuit.fromGeoPointProvider(
                rawProof
            );

            const zkExactGeoPointProof: ZKExactGeoPointCircuitProof = new ZKExactGeoPointCircuitProof(this, rawExactGeoPointProof);
            return zkExactGeoPointProof;
        }
    };
}
