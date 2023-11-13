import { Experimental, SelfProof, Empty, Proof, Field, Struct, Provable, Bool} from "o1js";
import { proveCoordinatesIn3PointPolygon, AND, OR, proveSourcedCoordinatesIn3PointPolygon, proofGeoPointInPolygonCommitmentFromOutput, expandTimeStampInterval} from '../../logic/Methods';

import { CoordinatePolygonInclusionExclusionProof, GeoPointInPolygonCommitment, GeoPointWithTimestampIntervalInPolygonCommitment } from '../../model/private/Commitment';
import { GeoPoint, ThreePointPolygon } from '../../model/Geography';
import { fromCoordinatesInPolygonProof } from '../../logic/Methods';
import { combine } from '../../logic/Methods';
import { TimestampInterval } from "../../model/Time";
import { geoPointWithTimeStampInPolygonAND, geoPointWithTimeStampInPolygonOR, proofAttachSourcedTimestampinterval } from "../../logic/Methods";



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
        
        proofFromOutput: {
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

export const GeoPointWithTimestampInPolygon = Experimental.ZkProgram({
    publicOutput: GeoPointWithTimestampIntervalInPolygonCommitment,

    methods: {
        proofAttachSourcedTimestampinterval: {
            privateInputs: [SelfProof<Empty, GeoPointInPolygonCommitment>, SelfProof<Empty, TimestampInterval>],
            method: proofAttachSourcedTimestampinterval,
        }, 

        increaseTimeStampInterval: {
            privateInputs: [GeoPointWithTimestampIntervalInPolygonCommitment, TimestampInterval],
            method: expandTimeStampInterval,
        },

        increaseTimeStampIntervalRecursive: {
            privateInputs: [SelfProof<Empty, GeoPointWithTimestampIntervalInPolygonCommitment>, TimestampInterval],
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
