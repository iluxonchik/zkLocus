import { Bool, JsonProof } from "o1js";
import { OracleAuthenticatedGeoPointCommitment } from "../../model/private/Oracle";
import { OracleGeoPointProviderCircuit, OracleGeoPointProviderCircuitProof } from "../../zkprogram/private/Oracle";
import type { ZKGeoPoint } from "../models/ZKGeoPoint";
import type { ZKPublicKey } from "../models/ZKPublicKey";
import type { ZKSignature } from "../models/ZKSignature";
import { IO1JSProof } from "./Types";
import { ZKLocusProof, ZKOracleAuthenticatedGeoPointCommitment } from "./ZKLocusProof";
import CachingProofVerificationMiddleware from "./middleware/CachingProofVerificationMiddleware";


@CachingProofVerificationMiddleware
export class ZKOracleGeoPointProviderCircuitProof extends ZKLocusProof<OracleGeoPointProviderCircuitProof> {
    protected static _circuit = OracleGeoPointProviderCircuit;
    protected static _dependentProofs = []


    constructor(protected zkPublicKey: ZKPublicKey, protected zkSignature: ZKSignature, protected _zkGeoPoint: ZKGeoPoint, proof: OracleGeoPointProviderCircuitProof) {
        super();
        this._proof = proof;
    }

    static fromJSON(jsonProof: JsonProof): IO1JSProof {
        return OracleGeoPointProviderCircuitProof.fromJSON(jsonProof);
    }

    /**
     * Verify that the commitment output by the zero-knowlede circuit matches the claimed GeoPoint and PublicKey.
     */
    assertGeoPointIsTheClaimedOne(): void {
        const commitment: OracleAuthenticatedGeoPointCommitment = this._proof.publicOutput;
        const commitmentVerifier: ZKOracleAuthenticatedGeoPointCommitment = new ZKOracleAuthenticatedGeoPointCommitment(this._zkGeoPoint, this.zkPublicKey, commitment);
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
    get zkGeoPoint(): ZKGeoPoint {
        this.verify();
        return this._zkGeoPoint;
    }

    toJSON(): JsonProof {
        return this._proof.toJSON();
    }
}
