import { PrivateKey } from "o1js";
import { ZKLocusAdopter } from "../adopters/Interfaces";
import ZKPrivateKeyToPrivateKeyAdopter from "../adopters/ZKPrivateKeyToPrivateKeyAdopter";
import { ZKKeyPair } from "./ZKKeyPair";
import { ZKPublicKey } from "./ZKPublicKey";



@ZKPrivateKeyToPrivateKeyAdopter
export class ZKPrivateKey extends ZKKeyPair<PrivateKey> {
    protected _raw: PrivateKey | string;

    constructor(privateKeyOrBase58: PrivateKey | string) {
        super();
        if (typeof privateKeyOrBase58 === "string") {
            this.key = PrivateKey.fromBase58(privateKeyOrBase58);
        } else {
            this.key = privateKeyOrBase58;
        }
        this._raw = privateKeyOrBase58;
    }

    get raw(): PrivateKey | string {
        return this._raw;
    }

    get normalized(): PrivateKey {
        return this.key;
    }

    /**
     * Derives the associated public key.
     * @returns a {@link ZKPublicKey}.
     */
    toPublicKey(): ZKPublicKey {
        return new ZKPublicKey(this.key.toPublicKey());
    }

    verifyPublicKey(zkPublicKey: ZKPublicKey): boolean {
        return this.key.toPublicKey().toBase58() === zkPublicKey.toBase58();
    }
}
// Declaration merging for ZKPrivateKey with the adopter's methods

export interface ZKPrivateKey extends ZKLocusAdopter<PrivateKey | string, PrivateKey, PrivateKey> { }
