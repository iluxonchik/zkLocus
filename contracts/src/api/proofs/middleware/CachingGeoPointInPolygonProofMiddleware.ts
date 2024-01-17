import { GeoPointInPolygonCircuitProof } from "../../../zkprogram/private/GeoPointInPolygonCircuit";
import { Bool } from "o1js";
import type { ZKGeoPointInPolygonProof } from "../ZKGeoPointInPolygonProof";

/**
 * This is a middleware that adds caching and cache invalidation to the verification of a proof. It should be used as a decorator on a class that extends ZKGeoPointInPolygonProof.
 * @param Base - The base class to extend
 * @returns A class that extends the base class and adds caching to the verification of the proof
 */
export default function <T extends new (...args: any[]) => ZKGeoPointInPolygonProof>(Base: T) {
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
 

        get isCached(): boolean {
            return this.isVerified;
        }

        protected setProof(proof: GeoPointInPolygonCircuitProof): void { 
            super.setProof(proof);
            this.isVerified = false;
        }

        async AND(other: ZKGeoPointInPolygonProof): Promise<ZKGeoPointInPolygonProof> {
            const result = await super.AND(other);
            this.isVerified = false;
            return result;
        }

    };
}

