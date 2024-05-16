import { Bool } from "o1js";
import { ZKLocusProof } from "../ZKLocusProof";

/**
 * This is a middleware that adds caching to the verification of a proof. It should be used as a decorator on a class that extends ZKLocusProof.
 * @param Base - The base class to extend
 * @returns A class that extends the base class and adds caching to the verification of the proof
 */
export default function <T extends new (...args: any[]) => ZKLocusProof<any>>(Base: T) {
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

    };
}

