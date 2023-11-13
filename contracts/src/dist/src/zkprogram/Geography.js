import { Experimental, SelfProof } from "o1js";
import { proveCoordinatesIn3PointPolygon, AND, OR } from '../logic/Methods';
import { CoordinatePolygonInclusionExclusionProof, CoordinateInPolygonCommitment } from '../model/Commitment';
import { NoncedGeographicalPoint, ThreePointPolygon } from '../model/Geography';
import { fromCoordinatesInPolygonProof } from '../logic/Methods';
import { combine } from '../logic/Methods';
/**
 * Set of ZK circuts responsible for verifying that a geographical point is within a polygon,
 * and contains the logic for combining multiple proofs into a single one.
 *
 * The source of the geographical point is attested by the proof from where the point is sourced.
 */
export const CoordinatesInPolygon = Experimental.ZkProgram({
    publicOutput: CoordinateInPolygonCommitment,
    methods: {
        proveCoordinatesIn3PointPolygon: {
            privateInputs: [NoncedGeographicalPoint, ThreePointPolygon],
            method: proveCoordinatesIn3PointPolygon,
        },
        AND: {
            privateInputs: [
                (SelfProof),
                (SelfProof),
            ],
            method: AND,
        },
        OR: {
            privateInputs: [
                (SelfProof),
                (SelfProof),
            ],
            method: OR,
        },
    },
});
/**
 *
 */
export const CoordinatesWithTimestampInPolygon = Experimental.ZkProgram({
    publicOutput: CoordinateInPolygonCommitment,
    methods: {
        proveCoordinatesIn3PointPolygon: {
            privateInputs: [NoncedGeographicalPoint, ThreePointPolygon],
            method: proveCoordinatesIn3PointPolygon,
        },
        AND: {
            privateInputs: [
                (SelfProof),
                (SelfProof),
            ],
            method: AND,
        },
        OR: {
            privateInputs: [
                (SelfProof),
                (SelfProof),
            ],
            method: OR,
        },
    },
});
export const CoordinatesInOrOutOfPolygon = Experimental.ZkProgram({
    publicOutput: CoordinatePolygonInclusionExclusionProof,
    methods: {
        fromCoordinatesInPolygonProof: {
            privateInputs: [(SelfProof)],
            method: fromCoordinatesInPolygonProof,
        },
        combine: {
            privateInputs: [
                (SelfProof),
                (SelfProof),
            ],
            method: combine,
        },
    },
});
//# sourceMappingURL=Geography.js.map