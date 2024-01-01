import { JsonProof } from "o1js";
import { Bool } from "o1js/dist/node/lib/bool";
import { GeoPointProviderCircuit, GeoPointProviderCircuitProof } from "../../zkprogram/private/Geography";
import type { ZKSignature } from "../models/ZKSignature";
import type { ZKPublicKey } from "../models/ZKPublicKey";
import type { ZKGeoPoint } from "../models/ZKGeoPoint";
import { IO1JSProof } from "./Types";
import { OracleAuthenticatedGeoPointCommitment } from "../../model/private/Oracle";
import { OracleGeoPointProviderCircuit, OracleGeoPointProviderCircuitProof } from "../../zkprogram/private/Oracle";
import CachingProofVerificationMiddleware from "./middleware/CachingProofVerificationMiddleware";
import { ZKLocusProof, ZKOracleAuthenticatedGeoPointCommitment } from "./ZKLocusProof";


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
