import { Cache } from "o1js";
import {ICompilableZKLocusProof} from "../Interfaces";
import { ZKProgramCompileResult } from "../Types";
import { ZKExactGeolocationMetadataCircuitProof } from "../ZKExactGeolocationMetadataCircuitProof";


export default class implements ICompilableZKLocusProof {
    async compile(cache?: Cache | undefined, forceRecompile?: boolean | undefined): Promise<ZKProgramCompileResult> {
        return await ZKExactGeolocationMetadataCircuitProof.compile(cache, forceRecompile);
    }


}