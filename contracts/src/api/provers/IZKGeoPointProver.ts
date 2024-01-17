
import type { ZKSignature } from "../models/ZKSignature";
import type { ZKPublicKey } from "../models/ZKPublicKey";
import type { ZKThreePointPolygon } from "../models/ZKThreePointPolygon";
import type { ZKGeoPoint } from "../models/ZKGeoPoint";
import type { IZKProver } from "./Interfaces";
import type { ZKGeoPointInPolygonProof } from "../proofs/ZKGeoPointInPolygonProof";
import type { ZKExactGeoPointCircuitProof } from "../proofs/ZKExactGeoPointCircuitProof";
import type { ZKGeoPointProviderCircuitProof } from "../proofs/ZKGeoPointProviderCircuitProof";
import type { ZKExactGeolocationMetadataCircuitProof } from "../proofs/ZKExactGeolocationMetadataCircuitProof";
import type { ZKGeoPointInOrOutOfPolygonCircuitProof } from "../proofs/ZKGeoPointInOrOutOfPolygonCircuitProof";

export type ZKGeoPointConstructor = new (...args: any[]) => ZKGeoPoint;

export interface IZKGeoPointProver extends IZKProver {

    Prove: {
        inPolygon: (polygon: ZKThreePointPolygon) => Promise<ZKGeoPointInPolygonProof>;
        inPolygons: (polygons: ZKThreePointPolygon[]) => Promise<ZKGeoPointInPolygonProof[]>;
        combineProofs: (proofs: ZKGeoPointInPolygonProof[]) => Promise<ZKGeoPointInPolygonProof>;
        combinePointInPolygonProofs: () => Promise<ZKGeoPointInOrOutOfPolygonCircuitProof>;
        authenticateFromIntegrationOracle: (publicKey: ZKPublicKey, signature: ZKSignature) => Promise<ZKGeoPointProviderCircuitProof>;
        exactGeoPoint: () => Promise<ZKExactGeoPointCircuitProof>;
        attachMetadata: (metadata: string) => Promise<ZKExactGeolocationMetadataCircuitProof>;
    };
}