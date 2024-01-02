import { Field, JsonProof, ZkProgram} from "o1js";
import { Bool } from "o1js/dist/node/lib/bool";
import type { ZKPublicKey } from "../models/ZKPublicKey";
import type { ZKThreePointPolygon } from "../models/ZKThreePointPolygon";
import type { ZKGeoPoint } from "../models/ZKGeoPoint";
import { GeoPointInPolygonCommitment } from "../../model/private/Commitment";
import { GeoPoint, ThreePointPolygon } from "../../model/Geography";
import { ZKProgramCompileResult} from "./Types";
import { OracleAuthenticatedGeoPointCommitment } from "../../model/private/Oracle";
import { Cache } from "o1js/dist/node/lib/proof-system/cache";
import { ZKProgramCircuit } from "./Types";
import { ICompilableZKLocusProof } from "./ICompilableZKLocusProof";



export abstract class ZKCommitment{
    protected commitment: any;
    // TODO: this can be used when verificaiton is turned off? Or maybe use a separate class for that, like VerifiedZKCommitment?
    //protected isVerified: boolean; 
}

/**
 * This class represents a commitment to a ZKGeoPoint being inside or outside a ZKThreePointPolygon.
 * It's an abstraction over the GeoPointInPolygonCommitment class, which is the actual zero-knowledge commitment.
 */
export class ZKGeoPointInPolygonCommitment extends ZKCommitment {
    protected commitment: GeoPointInPolygonCommitment;
    protected geoPoint: ZKGeoPoint;
    protected polygon: ZKThreePointPolygon;

    constructor(geoPoint: ZKGeoPoint, polygon: ZKThreePointPolygon, commitment: GeoPointInPolygonCommitment) {
        super();
        this.geoPoint = geoPoint;
        this.polygon = polygon;
        this.commitment = commitment;
    }

    verify(): void {
        const polygonCommitment: Field = this.commitment.polygonCommitment;
        const geoPointCommitment: Field = this.commitment.geoPointCommitment;

        const claimedPolygon: ThreePointPolygon = this.polygon.toZKValue();
        const claimedGeoPoint: GeoPoint = this.geoPoint.toZKValue();
        
        const claimedPolygonCommitment: Field = claimedPolygon.hash();
        const claimedGeoPointCommitment: Field = claimedGeoPoint.hash();

        if (claimedPolygonCommitment !== polygonCommitment) {
            throw new Error(`Polygon Commitment does not match the claimed one. Claimed: ${claimedPolygonCommitment.toString()}. Actual: ${polygonCommitment.toString()}`);
        }

        if (claimedGeoPointCommitment !== geoPointCommitment) {
            throw new Error(`GeoPoint Commitment does not match the claimed one. Claimed: ${claimedGeoPointCommitment.toString()}. Actual: ${geoPointCommitment.toString()}`);
        }
    }
}

/**
 * Commitment to a GeoPoint being authenticated by an Oracle.
 * This class represents a commitment to a ZKGeoPoint being signed by a ZKPublicKey.
 */
export class ZKOracleAuthenticatedGeoPointCommitment extends ZKCommitment {
    protected commitment: OracleAuthenticatedGeoPointCommitment;
    protected zkGeoPoint: ZKGeoPoint;
    protected zkkPublicKey: ZKPublicKey;

    constructor(geoPoint: ZKGeoPoint, publicKey: ZKPublicKey, commitment: OracleAuthenticatedGeoPointCommitment) {
        super();
        this.zkGeoPoint = geoPoint;
        this.zkkPublicKey = publicKey;
        this.commitment = commitment;
    }

    /**
     * Verify that the commitment corresponds to the claimed GeoPoint and PublicKey.
     * In zkLocus, a commitment to a GeoPoint is the Poseidon hash of the GeoPoint's latitude, longitude and factor, 
     * while a commitment to a PublicKey is the Poseidon hash of the PublicKey's field array.
     */
    verify(): void {
        // Oracle commitment data
        const publicKeyHash: Field = this.commitment.publicKeyHash;
        const geoPointHash: Field = this.commitment.geoPointHash;

        // Claimed data
        const claimedPublicKeyHash: Field = this.zkkPublicKey.hash();
        const claimedGeoPointHash: Field = this.zkGeoPoint.hash();

        // Verify that the claimed data matches the commitment data
        if (!claimedPublicKeyHash.equals(publicKeyHash)) {
            throw new Error(`Public Key Hash does not match the claimed one. Claimed: ${claimedPublicKeyHash.toString()}. Actual: ${publicKeyHash.toString()}`);
        }

        if (!claimedGeoPointHash.equals(geoPointHash)) {
            throw new Error(`GeoPoint Hash does not match the claimed one. Claimed: ${claimedGeoPointHash.toString()}. Actual: ${geoPointHash.toString()}`);
        }
    }
}


/*
    This is the parent abstraction class for all zkLocus proofs. Any zkLocus proof is interpertable and abstractble by
    this type. It can load and convert proofs to JSON, combine proofs together, and verify them.

    Internally, it uses the zkLocus API to perform the operations. It also contains properties based on the
    proof structure.
*/
export abstract class ZKLocusProof<P extends InstanceType<ReturnType<typeof ZkProgram.Proof>>>{
    // TODO:
    // - C extends ReturnType<typeof ZkProgram<any, any>> may not be the most elegant way to do this. Subclasess of ZKLocusProof only seem to work when "any" is used as the type for C
    protected _proof: P;
    protected static _circuit: ZKProgramCircuit;
    protected static _compiledCircuit: ZKProgramCompileResult | undefined;
    /**
     * The set of dependent proofs that need to be compiled to enable generation and verification of proofs of this type.
     */
    protected static _dependentProofs: ICompilableZKLocusProof[];


    verify(): void {
        return this._proof.verify();
    }
    
    verifyIf(condition: Bool): void {
        return this._proof.verifyIf(condition);
    }

    toJSON(): JsonProof {
        return this._proof.toJSON();
    }
 
    /**
     * Compiles the circuit associated with this proof. A ceche is used to store the compiled circuit & keys, so that it doesn't have to be 
     * recompiled every time. Once a circuit has been compiled within the scope of an execution, it does not need to be recompiled again.
     * 
     * @param cache - The cache to use for compilation. Defaults to Cache.FileSystemDefault.
     * @param forceRecompile - Whether to force recompilation even if the circuit is already compiled. Defaults to false.
     * @returns A promise that resolves to an object containing the verification key data and hash.
     */
    static async compile(cache: Cache | undefined = Cache.FileSystemDefault, forceRecompile: boolean = false): Promise<ZKProgramCompileResult> {
        
        for (const proof of this._dependentProofs) {
            await proof.compile(cache, forceRecompile);
        }


        if (this.compiledCircuit !== undefined && !forceRecompile) {
            return this.compiledCircuit;
        }
        
        const result: ZKProgramCompileResult = await this._circuit.compile(
            {
                cache: cache,
                forceRecompile: forceRecompile
            }
        );
        this._compiledCircuit = result;
        return result;
    }

    static get isCompiled(): boolean {
        if (this.compiledCircuit === undefined) {
            return false;
        }
        return true;
    }

    static get compiledCircuit(): ZKProgramCompileResult | undefined {
        return this._compiledCircuit;
    }

    /**
     * The set of dependent proofs that need to be compiled to enable generation and verification of proofs of this type.
     */
    static get dependentProofs(): ICompilableZKLocusProof[] {
        return this._dependentProofs;
    }

    get proof(): P {
        return this._proof;
    }  
}


