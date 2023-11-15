import { SelfProof } from "o1js";
import { CoordinatePolygonInclusionExclusionProof, CoordinateInPolygonCommitment } from '../model/Commitment';
import { NoncedGeographicalPoint, ThreePointPolygon } from '../model/Geography';
/**
 * Set of ZK circuts responsible for verifying that a geographical point is within a polygon,
 * and contains the logic for combining multiple proofs into a single one.
 *
 * The source of the geographical point is attested by the proof from where the point is sourced.
 */
export declare const CoordinatesInPolygon: {
    name: string;
    compile: () => Promise<{
        verificationKey: string;
    }>;
    verify: (proof: import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>) => Promise<boolean>;
    digest: () => string;
    analyzeMethods: () => {
        rows: number;
        digest: string;
        result: unknown;
        gates: import("o1js/dist/node/snarky").Gate[];
        publicInputSize: number;
    }[];
    publicInputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<undefined, null>;
    publicOutputType: typeof CoordinateInPolygonCommitment;
} & {
    proveGeoPointIn3PointPolygon: (...args: [NoncedGeographicalPoint, ThreePointPolygon] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>>;
    AND: (...args: [SelfProof<undefined, CoordinateInPolygonCommitment>, SelfProof<undefined, CoordinateInPolygonCommitment>] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>>;
    OR: (...args: [SelfProof<undefined, CoordinateInPolygonCommitment>, SelfProof<undefined, CoordinateInPolygonCommitment>] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>>;
};
/**
 *
 */
export declare const CoordinatesWithTimestampInPolygon: {
    name: string;
    compile: () => Promise<{
        verificationKey: string;
    }>;
    verify: (proof: import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>) => Promise<boolean>;
    digest: () => string;
    analyzeMethods: () => {
        rows: number;
        digest: string;
        result: unknown;
        gates: import("o1js/dist/node/snarky").Gate[];
        publicInputSize: number;
    }[];
    publicInputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<undefined, null>;
    publicOutputType: typeof CoordinateInPolygonCommitment;
} & {
    proveGeoPointIn3PointPolygon: (...args: [NoncedGeographicalPoint, ThreePointPolygon] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>>;
    AND: (...args: [SelfProof<undefined, CoordinateInPolygonCommitment>, SelfProof<undefined, CoordinateInPolygonCommitment>] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>>;
    OR: (...args: [SelfProof<undefined, CoordinateInPolygonCommitment>, SelfProof<undefined, CoordinateInPolygonCommitment>] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinateInPolygonCommitment>>;
};
export declare const CoordinatesInOrOutOfPolygon: {
    name: string;
    compile: () => Promise<{
        verificationKey: string;
    }>;
    verify: (proof: import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinatePolygonInclusionExclusionProof>) => Promise<boolean>;
    digest: () => string;
    analyzeMethods: () => {
        rows: number;
        digest: string;
        result: unknown;
        gates: import("o1js/dist/node/snarky").Gate[];
        publicInputSize: number;
    }[];
    publicInputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<undefined, null>;
    publicOutputType: typeof CoordinatePolygonInclusionExclusionProof;
} & {
    fromCoordinatesInPolygonProof: (...args: [SelfProof<undefined, CoordinateInPolygonCommitment>] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinatePolygonInclusionExclusionProof>>;
    combine: (...args: [SelfProof<undefined, CoordinatePolygonInclusionExclusionProof>, SelfProof<undefined, CoordinatePolygonInclusionExclusionProof>] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, CoordinatePolygonInclusionExclusionProof>>;
};
