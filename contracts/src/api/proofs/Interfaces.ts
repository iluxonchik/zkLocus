import { ZKProgramCompileResult } from "./Types";
import { Cache } from "o1js/dist/node/lib/proof-system/cache";

/**
 * Represents a ZKLocusProof whose underlying circuit can be compiled.
 */
export interface ICompilableZKLocusProof {
    compile(cache?: Cache, forceRecompile?: boolean): Promise<ZKProgramCompileResult>;
}
