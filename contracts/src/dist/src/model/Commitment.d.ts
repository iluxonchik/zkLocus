import { GeographicalPoint, ThreePointPolygon } from './Geography.js';
import { IntervalTimestamp } from "./Time.js";
declare const CoordinateInPolygonCommitment_base: (new (value: {
    polygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
    isInPolygon: import("o1js/dist/node/lib/bool.js").Bool;
}) => {
    polygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
    isInPolygon: import("o1js/dist/node/lib/bool.js").Bool;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    polygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
    isInPolygon: import("o1js/dist/node/lib/bool.js").Bool;
}> & {
    toInput: (x: {
        polygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
        isInPolygon: import("o1js/dist/node/lib/bool.js").Bool;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        polygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
        isInPolygon: import("o1js/dist/node/lib/bool.js").Bool;
    }) => {
        polygonCommitment: string;
        coordinatesCommitment: string;
        isInPolygon: boolean;
    };
    fromJSON: (x: {
        polygonCommitment: string;
        coordinatesCommitment: string;
        isInPolygon: boolean;
    }) => {
        polygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
        isInPolygon: import("o1js/dist/node/lib/bool.js").Bool;
    };
};
export declare class CoordinateInPolygonCommitment extends CoordinateInPolygonCommitment_base {
    toString(): string;
}
declare const TimestampedCoordinateInPolygonCommitment_base: (new (value: {
    coordinateProofState: CoordinateInPolygonCommitment;
    timestamp: IntervalTimestamp;
}) => {
    coordinateProofState: CoordinateInPolygonCommitment;
    timestamp: IntervalTimestamp;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    coordinateProofState: CoordinateInPolygonCommitment;
    timestamp: IntervalTimestamp;
}> & {
    toInput: (x: {
        coordinateProofState: CoordinateInPolygonCommitment;
        timestamp: IntervalTimestamp;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        coordinateProofState: CoordinateInPolygonCommitment;
        timestamp: IntervalTimestamp;
    }) => {
        coordinateProofState: {
            polygonCommitment: string;
            coordinatesCommitment: string;
            isInPolygon: boolean;
        };
        timestamp: {
            start: string;
            end: string;
        };
    };
    fromJSON: (x: {
        coordinateProofState: {
            polygonCommitment: string;
            coordinatesCommitment: string;
            isInPolygon: boolean;
        };
        timestamp: {
            start: string;
            end: string;
        };
    }) => {
        coordinateProofState: CoordinateInPolygonCommitment;
        timestamp: IntervalTimestamp;
    };
};
export declare class TimestampedCoordinateInPolygonCommitment extends TimestampedCoordinateInPolygonCommitment_base {
    toString(): string;
}
declare const CoordinateProofStateWithMetadata_base: (new (value: {
    coordinateProofState: CoordinateInPolygonCommitment;
    metadata: import("o1js/dist/node/lib/field.js").Field;
}) => {
    coordinateProofState: CoordinateInPolygonCommitment;
    metadata: import("o1js/dist/node/lib/field.js").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    coordinateProofState: CoordinateInPolygonCommitment;
    metadata: import("o1js/dist/node/lib/field.js").Field;
}> & {
    toInput: (x: {
        coordinateProofState: CoordinateInPolygonCommitment;
        metadata: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        coordinateProofState: CoordinateInPolygonCommitment;
        metadata: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        coordinateProofState: {
            polygonCommitment: string;
            coordinatesCommitment: string;
            isInPolygon: boolean;
        };
        metadata: string;
    };
    fromJSON: (x: {
        coordinateProofState: {
            polygonCommitment: string;
            coordinatesCommitment: string;
            isInPolygon: boolean;
        };
        metadata: string;
    }) => {
        coordinateProofState: CoordinateInPolygonCommitment;
        metadata: import("o1js/dist/node/lib/field.js").Field;
    };
};
export declare class CoordinateProofStateWithMetadata extends CoordinateProofStateWithMetadata_base {
}
declare const CoordinatePolygonInclusionExclusionProof_base: (new (value: {
    insidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    outsidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
}) => {
    insidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    outsidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    insidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    outsidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
    coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
}> & {
    toInput: (x: {
        insidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        outsidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        insidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        outsidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        insidePolygonCommitment: string;
        outsidePolygonCommitment: string;
        coordinatesCommitment: string;
    };
    fromJSON: (x: {
        insidePolygonCommitment: string;
        outsidePolygonCommitment: string;
        coordinatesCommitment: string;
    }) => {
        insidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        outsidePolygonCommitment: import("o1js/dist/node/lib/field.js").Field;
        coordinatesCommitment: import("o1js/dist/node/lib/field.js").Field;
    };
};
export declare class CoordinatePolygonInclusionExclusionProof extends CoordinatePolygonInclusionExclusionProof_base {
    toString(): string;
}
declare const ProoveCoordinatesIn3dPolygonArgumentsValues_base: (new (value: {
    point: GeographicalPoint;
    polygon: ThreePointPolygon;
}) => {
    point: GeographicalPoint;
    polygon: ThreePointPolygon;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    point: GeographicalPoint;
    polygon: ThreePointPolygon;
}> & {
    toInput: (x: {
        point: GeographicalPoint;
        polygon: ThreePointPolygon;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        point: GeographicalPoint;
        polygon: ThreePointPolygon;
    }) => {
        point: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        polygon: {
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
    };
    fromJSON: (x: {
        point: {
            latitude: any;
            longitude: any;
            factor: any;
        };
        polygon: {
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
    }) => {
        point: GeographicalPoint;
        polygon: ThreePointPolygon;
    };
};
export declare class ProoveCoordinatesIn3dPolygonArgumentsValues extends ProoveCoordinatesIn3dPolygonArgumentsValues_base {
}
export {};
