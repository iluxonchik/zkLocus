import { Bool, JsonProof} from "o1js";


type Subclass<Class extends new (...args: any) => any> = (new (...args: any) => InstanceType<Class>) & {
    [K in keyof Class]: Class[K];
} & {
    prototype: InstanceType<Class>;
};

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
