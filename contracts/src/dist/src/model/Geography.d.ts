import { Int64 } from "o1js";
import { IntervalTimestamp } from './Time';
declare const GeographicalPoint_base: (new (value: {
    latitude: Int64;
    longitude: Int64;
    factor: Int64;
}) => {
    latitude: Int64;
    longitude: Int64;
    factor: Int64;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    latitude: Int64;
    longitude: Int64;
    factor: Int64;
}> & {
    toInput: (x: {
        latitude: Int64;
        longitude: Int64;
        factor: Int64;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        latitude: Int64;
        longitude: Int64;
        factor: Int64;
    }) => {
        latitude: any;
        longitude: any;
        factor: any;
    };
    fromJSON: (x: {
        latitude: any;
        longitude: any;
        factor: any;
    }) => {
        latitude: Int64;
        longitude: Int64;
        factor: Int64;
    };
};
/** Data Structures */
/**
 * Represents a geographical point. The point is represented as a pair of latitude and longitude values.
 * The latitude and longitude values are represented as Field values. The Field values are scaled to
 * the desired factor, in order to represent the desired percision. The percision is represented as
 * a Field value. The percision is the number of decimal points that the latitude and longitude values
 * have. For example, if the percision is 7, then the latitude and longitude values are scaled to
 * 7 decimal points. The latitude and longitude values are scaled by multiplying them with 10^7.
 * 10^7 is the scale factor. `factor` is used instead of percision to optimize the efficency, as it prevent
  the need to perform exponentiation computations
 */
export declare class GeographicalPoint extends GeographicalPoint_base {
    hash(): import("o1js/dist/node/lib/field").Field;
    assertIsValid(): void;
}
declare const GeographicalPointWithTimestamp_base: (new (value: {
    point: GeographicalPoint;
    timestamp: IntervalTimestamp;
}) => {
    point: GeographicalPoint;
    timestamp: IntervalTimestamp;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    point: GeographicalPoint;
    timestamp: IntervalTimestamp;
}> & {
    toInput: (x: {
        point: GeographicalPoint;
        timestamp: IntervalTimestamp;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        point: GeographicalPoint;
        timestamp: IntervalTimestamp;
    }) => {
        point: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        timestamp: {
            start: string;
            end: string;
        };
    };
    fromJSON: (x: {
        point: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        timestamp: {
            start: string;
            end: string;
        };
    }) => {
        point: GeographicalPoint;
        timestamp: IntervalTimestamp;
    };
};
export declare class GeographicalPointWithTimestamp extends GeographicalPointWithTimestamp_base {
    hash(): import("o1js/dist/node/lib/field").Field;
}
declare const NoncedGeographicalPoint_base: (new (value: {
    point: GeographicalPoint;
    nonce: import("o1js/dist/node/lib/field").Field;
}) => {
    point: GeographicalPoint;
    nonce: import("o1js/dist/node/lib/field").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    point: GeographicalPoint;
    nonce: import("o1js/dist/node/lib/field").Field;
}> & {
    toInput: (x: {
        point: GeographicalPoint;
        nonce: import("o1js/dist/node/lib/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        point: GeographicalPoint;
        nonce: import("o1js/dist/node/lib/field").Field;
    }) => {
        point: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        nonce: string;
    };
    fromJSON: (x: {
        point: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        nonce: string;
    }) => {
        point: GeographicalPoint;
        nonce: import("o1js/dist/node/lib/field").Field;
    };
};
export declare class NoncedGeographicalPoint extends NoncedGeographicalPoint_base {
    hash(): import("o1js/dist/node/lib/field").Field;
    assertIsValid(): void;
}
declare const ThreePointPolygon_base: (new (value: {
    vertice1: GeographicalPoint;
    vertice2: GeographicalPoint;
    vertice3: GeographicalPoint;
}) => {
    vertice1: GeographicalPoint;
    vertice2: GeographicalPoint;
    vertice3: GeographicalPoint;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    vertice1: GeographicalPoint;
    vertice2: GeographicalPoint;
    vertice3: GeographicalPoint;
}> & {
    toInput: (x: {
        vertice1: GeographicalPoint;
        vertice2: GeographicalPoint;
        vertice3: GeographicalPoint;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        vertice1: GeographicalPoint;
        vertice2: GeographicalPoint;
        vertice3: GeographicalPoint;
    }) => {
        vertice1: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        vertice2: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        vertice3: {
            latitude: any;
            longitude: any;
            factor: any;
        };
    };
    fromJSON: (x: {
        vertice1: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        vertice2: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        vertice3: {
            latitude: any;
            longitude: any;
            factor: any;
        };
    }) => {
        vertice1: GeographicalPoint;
        vertice2: GeographicalPoint;
        vertice3: GeographicalPoint;
    };
};
export declare class ThreePointPolygon extends ThreePointPolygon_base {
    hash(): import("o1js/dist/node/lib/field").Field;
    /**
     * Ensure that the `ThreePointPolygon` instance is valid. This includes
     * asserting that the coordinates are within the allowed values, and that
     * those coordinates are ordered correctly.
     */
    assertIsValid(): void;
    private assertIsVerticesValid;
    private assertIsOrderingValid;
}
export {};
