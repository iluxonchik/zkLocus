import { Field, SmartContract, State } from 'o1js';
declare const Batch_base: (new (value: {
    batch: import("o1js/dist/node/lib/field").Field[];
}) => {
    batch: import("o1js/dist/node/lib/field").Field[];
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    batch: import("o1js/dist/node/lib/field").Field[];
}> & {
    toInput: (x: {
        batch: import("o1js/dist/node/lib/field").Field[];
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        batch: import("o1js/dist/node/lib/field").Field[];
    }) => {
        batch: string[];
    };
    fromJSON: (x: {
        batch: string[];
    }) => {
        batch: import("o1js/dist/node/lib/field").Field[];
    };
};
export declare class Batch extends Batch_base {
}
export declare class MyContract extends SmartContract {
    sum: State<import("o1js/dist/node/lib/field").Field>;
    processFields(my_args: Field[]): void;
}
export {};
