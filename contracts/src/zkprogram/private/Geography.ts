import { Experimental, SelfProof, Empty, Proof, Field, Struct, Provable, Bool} from "o1js";
import { proveCoordinatesIn3PointPolygon, AND, OR, proveSourcedCoordinatesIn3PointPolygon, proofGeoPointInPolygonCommitmentFromOutput, expandTimeStampInterval, expandTimeStampIntervalRecursive, geoPointFromLiteral, timeStampIntervalFromLiteral} from '../../logic/Methods';

import { CoordinatePolygonInclusionExclusionProof, GeoPointInPolygonCommitment, GeoPointWithTimestampIntervalInPolygonCommitment } from '../../model/private/Commitment';
import { GeoPoint, ThreePointPolygon } from '../../model/Geography';
import { fromCoordinatesInPolygonProof } from '../../logic/Methods';
import { combine } from '../../logic/Methods';
import { TimeStampInterval } from "../../model/Time";
import { geoPointWithTimeStampInPolygonAND, geoPointWithTimeStampInPolygonOR, proofAttachSourcedTimestampinterval } from "../../logic/Methods";


/**
 * Set of ZK circuits that allow for the creation of a proof attesting to the validity of a geographical point. 
 * 
 * The output of this should be as an input to GeoPointInPolygon.
 */
export const GeoPointProof = Experimental.ZkProgram({
    publicOutput: GeoPoint,

    methods: {
        fromLiteral: {
            privateInputs: [GeoPoint],
            method: geoPointFromLiteral,
        },
    },
});

/**
 * Set of ZK circuts responsible for verifying that a geographical point is within a polygon,
 * and contains the logic for combining multiple proofs into a single one.
 * 
 * The source of the geographical point is attested by the proof from where the point is sourced.
 */
export const GeoPointInPolygon = Experimental.ZkProgram({
    publicOutput: GeoPointInPolygonCommitment,

    methods: {
        proveCoordinatesIn3PointPolygon: {
            privateInputs: [GeoPoint, ThreePointPolygon],
            method: proveCoordinatesIn3PointPolygon,
        },
        
        proveSourcedCoordinatesIn3PointPolygon: {
            privateInputs: [SelfProof<Empty, GeoPoint>, ThreePointPolygon],
            method: proveSourcedCoordinatesIn3PointPolygon,
        },
        
        proofFromPublicOutput: {
            privateInputs: [GeoPointInPolygonCommitment],
            method: proofGeoPointInPolygonCommitmentFromOutput,
        },

        AND: {
            privateInputs: [
                (SelfProof<Empty, GeoPointInPolygonCommitment>),
                (SelfProof<Empty, GeoPointInPolygonCommitment>),
            ],
            method: AND,
        },

        OR: {
            privateInputs: [
                (SelfProof<Empty, GeoPointInPolygonCommitment>),
                (SelfProof<Empty, GeoPointInPolygonCommitment>),
            ],
            method: OR,
        },
    },
});

/**
 * Set of ZK circuits that allow for the creation of a proof attesting to the validity of a timestamp interval.
 * 
 * The output of this should be as an input to `GeoPointWithTimestampInPolygon`.
 */
export const TimeStampIntervalProof = Experimental.ZkProgram({
    publicOutput: TimeStampInterval,

    methods: {
        fromLiteral: {
            privateInputs: [TimeStampInterval],
            method: timeStampIntervalFromLiteral,
        },
    },
});

/**
 * Set of ZK circuits responsible for attaching a timestamp to a GeoPoint in Polygon proof.
 * The source of the timestamp is attested by the proof from where the timestamp is sourced.
 * 
 * The means by which the timestamp is attached to the GeoPoint in Polygon proof is by
 * adding the timestamp to the GeoPoint in Polygon proof's public output. This follows the
 * architectural approach that I have developed as a part of developing zkLocus, and it consists 
 * of "attaching" data to a proof.
 */
export const GeoPointWithTimestampInPolygon = Experimental.ZkProgram({
    publicOutput: GeoPointWithTimestampIntervalInPolygonCommitment,

    methods: {
        proofAttachSourcedTimestampinterval: {
            privateInputs: [SelfProof<Empty, GeoPointInPolygonCommitment>, SelfProof<Empty, TimeStampInterval>],
            method: proofAttachSourcedTimestampinterval,
        }, 

        increaseTimeStampInterval: {
            privateInputs: [GeoPointWithTimestampIntervalInPolygonCommitment, TimeStampInterval],
            method: expandTimeStampInterval,
        },

        increaseTimeStampIntervalRecursive: {
            privateInputs: [SelfProof<Empty, GeoPointWithTimestampIntervalInPolygonCommitment>, TimeStampInterval],
            method: expandTimeStampIntervalRecursive,
        },

        AND: {
            privateInputs: [
                (SelfProof<Empty, GeoPointWithTimestampIntervalInPolygonCommitment>),
                (SelfProof<Empty, GeoPointWithTimestampIntervalInPolygonCommitment>),
            ],
            method: geoPointWithTimeStampInPolygonAND,
        },

        OR: {
            privateInputs: [
                (SelfProof<Empty, GeoPointWithTimestampIntervalInPolygonCommitment>),
                (SelfProof<Empty, GeoPointWithTimestampIntervalInPolygonCommitment>),
            ],
            method: geoPointWithTimeStampInPolygonOR,
        },
    },
});


export const CoordinatesInOrOutOfPolygon = Experimental.ZkProgram({
    publicOutput: CoordinatePolygonInclusionExclusionProof,

    methods: {
        fromCoordinatesInPolygonProof: {
            privateInputs: [(SelfProof<Empty, GeoPointInPolygonCommitment>)],
            method: fromCoordinatesInPolygonProof,
        },
        combine: {
            privateInputs: [
                (SelfProof<Empty, CoordinatePolygonInclusionExclusionProof>),
                (SelfProof<Empty, CoordinatePolygonInclusionExclusionProof>),
            ],
            method: combine,
        },
    },
});
