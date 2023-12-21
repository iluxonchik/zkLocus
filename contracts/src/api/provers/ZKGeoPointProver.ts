import type { ZKGeoPoint, ZKPublicKey, ZKSignature, ZKThreePointPolygon } from "../Models";
import { IZKProver } from "./Interfaces";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof, GeoPointProviderCircuit, GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";
import { ZKGeoPointInPolygonProof, ZKGeoPointSignatureVerificationCircuitProof, ZKLocusProof } from "../proofs/ZKLocusProof";
import { PublicKey, Signature } from "o1js";
import { GeoPointSignatureVerificationCircuitProof, OracleGeoPointProviderCircuit } from "../../zkprogram/private/Oracle";
import { GeoPoint } from "../../model/Geography";


export type ZKGeoPointConstructor = new (...args: any[]) => ZKGeoPoint;

export interface IZKGeoPointProver extends IZKProver {
    Prove: {
        inPolygon: (polygon: ZKThreePointPolygon) => Promise<ZKLocusProof>;
    };
}

export default function<T extends ZKGeoPointConstructor>(Base: T) {
    return class extends Base implements IZKGeoPointProver {

        Prove = {
            inPolygon: async (polygon: ZKThreePointPolygon): Promise<ZKGeoPointInPolygonProof> => {
                    const geoPointProof: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(this.toZKValue());
                    const geoPointInPolygonProof: GeoPointInPolygonCircuitProof = await GeoPointInPolygonCircuit.proveProvidedGeoPointIn3PointPolygon(geoPointProof, polygon.toZKValue());
                    return new ZKGeoPointInPolygonProof(this, polygon, geoPointInPolygonProof);
            },
            fromIntegrationOracleSignature: async (publicKey: ZKPublicKey, signature: ZKSignature, geoPoint: ZKGeoPoint): Promise<ZKGeoPointSignatureVerificationCircuitProof> => {
                const plainPublicKey: PublicKey = publicKey.toZKValue();
                const plainGeoPoint: GeoPoint = geoPoint.toZKValue();
                const plainSignature: Signature = signature.toZKValue();
                const proof: GeoPointSignatureVerificationCircuitProof = await OracleGeoPointProviderCircuit.fromSignature(
                    plainPublicKey,
                    plainSignature,
                    plainGeoPoint
                );

                return new ZKGeoPointSignatureVerificationCircuitProof(publicKey, signature, geoPoint, proof);
            },
        }

    };
}
