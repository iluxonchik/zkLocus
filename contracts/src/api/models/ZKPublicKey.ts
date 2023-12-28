import { Field, Poseidon, PublicKey } from "o1js";
import { ZKLocusAdopter } from "../adopters/Interfaces";
import ZKPublicKeyToPublicKeyAdopter from "../adopters/ZKPublicKeyToPublicKeyAdopter";
import { ZKKeyPair } from "./ZKKeyPair";
import { ZKPrivateKey } from "./ZKPrivateKey";



@ZKPublicKeyToPublicKeyAdopter
export class ZKPublicKey extends ZKKeyPair<PublicKey> {
    protected _raw: PublicKey | string;


    constructor(publicKeyOrBase58: PublicKey | string) {
        super();
        if (typeof publicKeyOrBase58 === "string") {
            this.key = PublicKey.fromBase58(publicKeyOrBase58);
        } else {
            this.key = publicKeyOrBase58;
        }
        this._raw = publicKeyOrBase58;
    }

    hash(): Field {
        const pubKeyAsFields: Field[] = this.key.toFields();
        return Poseidon.hash(pubKeyAsFields);
    }

    get raw(): PublicKey | string {
        return this._raw;
    }

    get normalized(): PublicKey {
        return this.key;
    }

    verifyPrivateKey(zkPrivateKey: ZKPrivateKey): boolean {
        return this.key.toBase58() === zkPrivateKey.toPublicKey().toBase58();
    }
}
// Declaration merging for ZKPublicKey with the adopter's methods

export interface ZKPublicKey extends ZKLocusAdopter<PublicKey, PublicKey, PublicKey> { }
