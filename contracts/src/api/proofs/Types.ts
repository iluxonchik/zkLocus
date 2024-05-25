import { Bool, Field, JsonProof} from "o1js";

export interface IVerifiedO1JSProof {
    toJSON(): JsonProof;
}

export interface IO1JSProof extends IVerifiedO1JSProof{
    verify(): void;
    verifyIf(condition: Bool): void;
}


export interface IO1JSProofConstructor {
    new (): IO1JSProof;
    fromJSON(jsonProof: JsonProof): IO1JSProof;
}


export type ZKProgramCompileResult = {verificationKey: {data: string, hash: Field}};
export type ZKProgramCircuit = {
    compile: (options?: {
        cache?: import("o1js/dist/node/lib/proof-system/cache").Cache;
        forceRecompile?: boolean;
    }) => Promise<{
        verificationKey: {
            data: string;
            hash: Field;
        };
    }>;
};
