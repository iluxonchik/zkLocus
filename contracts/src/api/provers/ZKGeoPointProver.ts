import type { ZKGeoPoint, ZKThreePointPolygon } from "../Models";
import { IZKProver } from "./Interfaces";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof, GeoPointProviderCircuit, GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";
import { ZKGeoPointInPolygonProof, ZKLocusProof } from "../proofs/ZKLocusProof";


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
            }
        }

    };
}
