declare const IntervalTimestamp_base: (new (value: {
    start: import("o1js/dist/node/lib/field").Field;
    end: import("o1js/dist/node/lib/field").Field;
}) => {
    start: import("o1js/dist/node/lib/field").Field;
    end: import("o1js/dist/node/lib/field").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    start: import("o1js/dist/node/lib/field").Field;
    end: import("o1js/dist/node/lib/field").Field;
}> & {
    toInput: (x: {
        start: import("o1js/dist/node/lib/field").Field;
        end: import("o1js/dist/node/lib/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        start: import("o1js/dist/node/lib/field").Field;
        end: import("o1js/dist/node/lib/field").Field;
    }) => {
        start: string;
        end: string;
    };
    fromJSON: (x: {
        start: string;
        end: string;
    }) => {
        start: import("o1js/dist/node/lib/field").Field;
        end: import("o1js/dist/node/lib/field").Field;
    };
};
export declare class IntervalTimestamp extends IntervalTimestamp_base {
    hash(): import("o1js/dist/node/lib/field").Field;
    assertIsValid(): void;
}
export {};
