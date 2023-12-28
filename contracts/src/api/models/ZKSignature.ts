import { Field, PublicKey, Signature } from "o1js";
import { ZKLocusAdopter } from "../adopters/Interfaces";
import ZKSignatureToSignatureAdopter from "../adopters/ZKSignatureToSignatureAdopter";



@ZKSignatureToSignatureAdopter
export class ZKSignature {
    protected signature: Signature;
    protected _raw: Signature | string;

    constructor(signatureOrBase58: Signature | string) {
        if (typeof signatureOrBase58 === "string") {
            this.signature = Signature.fromBase58(signatureOrBase58);
        } else {
            this.signature = signatureOrBase58;
        }
        this._raw = signatureOrBase58;
    }

    get raw(): Signature | string {
        return this._raw;
    }

    get normalized(): Signature {
        return this.signature;
    }

    toBase58(): string {
        return this.signature.toBase58();
    }

    verify(publicKey: PublicKey, msg: Field[]): boolean {
        return this.signature.verify(publicKey, msg).toBoolean();
    }
}
// Declaration merging for ZKSignature with the adopter's methods

export interface ZKSignature extends ZKLocusAdopter<Signature | string, Signature, Signature> { }
