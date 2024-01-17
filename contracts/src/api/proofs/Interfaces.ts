import { ZKProgramCompileResult } from "./Types";
import { Cache } from "o1js/dist/node/lib/proof-system/cache";
import type { ZKLocusProof } from "./ZKLocusProof";

/**
 * Represents a ZKLocusProof whose underlying circuit can be compiled.
 */
export interface ICompilableZKLocusProof {
    compile(cache?: Cache, forceRecompile?: boolean): Promise<ZKProgramCompileResult>;
}

/**
 * Represents a cloneable proof.
 * @template T - The type of the proof.
 */
export interface ICloneableProof<T extends ZKLocusProof<any>> {
    /**
     * Creates a clone of the proof.
     * @returns The cloned proof.
     */
    clone(): T;
}
