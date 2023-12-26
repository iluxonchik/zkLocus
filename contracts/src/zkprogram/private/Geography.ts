import { Experimental, SelfProof, Empty, ZkProgram} from "o1js";
import { AND, OR, proofGeoPointInPolygonCommitmentFromOutput, expandTimeStampInterval, expandTimeStampIntervalRecursive, geoPointFromLiteral, timeStampIntervalFromLiteral, proveProvidedGeoPointIn3PointPolygon, exactGeoPointFromOracle} from '../../logic/Methods';

import { GeoPointPolygonInclusionExclusionProof, GeoPointCommitment, GeoPointInPolygonCommitment, GeoPointWithTimeStampIntervalInPolygonCommitment } from '../../model/private/Commitment';
import { GeoPoint, ThreePointPolygon } from '../../model/Geography';
import { fromCoordinatesInPolygonProof } from '../../logic/Methods';
import { combine } from '../../logic/Methods';
import { TimeStampInterval } from "../../model/Time";
import { geoPointWithTimeStampInPolygonAND, geoPointWithTimeStampInPolygonOR, proofAttachSourcedTimestampinterval } from "../../logic/Methods";
import { GeoPointSignatureVerificationCircuitProof } from "./Oracle";


/**
 * zkLocus allows you to create proofs that a ceratin GeoPoint is within a Polygon, at a certain time, without revealing anything about your geographical coordinates,
 * or the precise time that you were at at that polygon. Here is a mental model to follow for creating GeoPoint in Polygon proofs in zkLocus:
 * 
 * 1. Create a GeoPoint proof attesting to the validity of a geographical point. This proof will be passed as an argument to `GeoPointInPolygon` methods.
 * 2. Chose a polygon that you want to prove that the geographical point is in. This polygon must be a 3 point polygon. Use the `ThreePointPolygon` struct. 
 * 3. Prove that a point is in polygon, using the proof from step 1, and the polygon from step 2 as private intputs. Use the `GeoPointInPolygon` methods.
 * 4. Optionally, you can create more proofs of GeoPoint in polygon, and combine them using the `GeoPointInPolygon.OR` and `GeoPointInPolygon.AND` methods.
 * The GeoPoint that is being attested to must be the same for all proofs that are being combined, while the polygon can be distinct.
 * 5. Optionally, you can attach a timestamp to the GeoPoint in Polygon proof. The circuit that "attaches" the proof works by receiving the 
 * GeoPoint in Polygon Proof and the timestamp as private inputs, and it returns the a new Struct that is the combnation of public output of the
 * GeoPoint in Polygon proof's public output, and the timestamp. This is done by using the `GeoPointWithTimestampInPolygon` methods:
 *  5.1 Create a timestamp interval proof attesting to the validity of a timestamp interval. This proof will be passed as an argument to `GeoPointWithTimestampInPolygon` methods.
 *  5.2 Attach the timestamp interval proof to the GeoPoint in Polygon proof, using the `GeoPointWithTimestampInPolygon.proofAttachSourcedTimestampinterval` method.
 * 6. You now have a Zero-Knowledge proof that a geographical point provided by a source (e.g. Hardware, Google API, etc) is within a polygon (i.e. a geographical area),
 * and that the geographical point was within the polygon at a specific time interval (e.g. between 1PM and 3PM on December 1st 2023, or sometime in the year of 2023).
 */

/**
 * zkLocus also allows you to create proofs that you are at a certain GeoPoint, at a certain time. This allows for sharing your exact location with a third party,
 * while still allowing you to control the precision of the timestamp. zkLocus also allows you to apply a nonce to the GeoPoint (i.e. the geopgrahical coordinates),
 * and in this way, you are not revealing your exact coordinates to the public, but only to the parties that you share the nonce with. Here is a mental model to follow
 * for creating a GeoPoint with Timestamp proofs in zkLocus:
 * 
 * 1. Create a GeoPoint proof attesting to the validity of a geographical point. This proof will be passed as an argument to `ExactGeoPoint` methods.
 * 2. Optionally, you can attach a timestamp to the ExactGeoPoint proof. The circuit that "attaches" the proof works by receiving the 
 * ExactGeoPoint proof and the timestamp as private inputs, and it returns the a new Struct that is the combnation of public output of the
 * ExactGeoPoint proof's public output, and the timestamp. This is done by using the `ExactGeoPointWithTimestamp` methods:
 *  3.1 Create a timestamp interval proof attesting to the validity of a timestamp interval. This proof will be passed as an argument to `ExactGeoPointWithTimestamp` methods.
 *  3.1 Attach the timestamp interval proof to the GeoPoint in Polygon proof, using the `ExactGeoPointWithTimestamp.proofAttachSourcedTimestampinterval` method.
 * 4. You now have a Zero-Knowledge proof of the exact geopgraphical coordinate provided by a source (e.g. Hardware, Google API, etc) is within a polygon (i.e. a geographical area),
 * and that the geographical point is associated at a specific time interval (e.g. between 1PM and 3PM on December 1st 2023, or sometime in the year of 2023).
 */


/**
 * Set of ZK circuits that allow for the creation of a proof attesting to the validity of a geographical point. 
 * 
 * The output of this should be as an input to GeoPointInPolygon.
 */
export const GeoPointProviderCircuit = ZkProgram({
    name: "GeoPointProviderCircuit",

    publicOutput: GeoPoint,

    methods: {
        fromLiteralGeoPoint: {
            privateInputs: [GeoPoint],
            method: geoPointFromLiteral,
        },

        fromOracle: {
            privateInputs: [GeoPointSignatureVerificationCircuitProof, GeoPoint],
            method: exactGeoPointFromOracle,
        },

    },
});

export class GeoPointProviderCircuitProof extends ZkProgram.Proof(GeoPointProviderCircuit) {}

/**
 * Set of ZK circuts responsible for verifying that a geographical point is within a polygon,
 * and contains the logic for combining multiple proofs into a single one.
 * 
 * The source of the geographical point is attested by the proof from where the point is sourced.
 */
export const GeoPointInPolygonCircuit = ZkProgram({
    name: "Geo Point In Polygon Circuit",
    publicOutput: GeoPointInPolygonCommitment,

    methods: { 
        proveProvidedGeoPointIn3PointPolygon: {
            privateInputs: [GeoPointProviderCircuitProof, ThreePointPolygon],
            method: proveProvidedGeoPointIn3PointPolygon,
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

export class GeoPointInPolygonCircuitProof extends ZkProgram.Proof(GeoPointInPolygonCircuit) {}


/**
 * Set of ZK circuits that allow for the creation of a proof attesting to the validity of a timestamp interval.
 * 
 * The output of this should be as an input to `GeoPointWithTimestampInPolygon`.
 */
export const TimeStampIntervalProviderCircuit = Experimental.ZkProgram({
    publicOutput: TimeStampInterval,

    methods: {
        fromLiteral: {
            privateInputs: [TimeStampInterval],
            method: timeStampIntervalFromLiteral,
        },
    },
});

export class TimeStampIntervalProviderCircuitProof extends ZkProgram.Proof(TimeStampIntervalProviderCircuit) {}

/**
 * Set of ZK circuits responsible for attaching a timestamp to a GeoPoint in Polygon proof.
 * The source of the timestamp is attested by the proof from where the timestamp is sourced.
 * 
 * The means by which the timestamp is attached to the GeoPoint in Polygon proof is by
 * adding the timestamp to the GeoPoint in Polygon proof's public output. This follows the
 * architectural approach that I have developed as a part of developing zkLocus, and it consists 
 * of "attaching" data to a proof.
 */
export const GeoPointWithTimestampInPolygonCircuit = Experimental.ZkProgram({
    publicOutput: GeoPointWithTimeStampIntervalInPolygonCommitment,

    methods: {
        proofAttachProvidedTimestampinterval: {
            privateInputs: [GeoPointInPolygonCircuitProof, TimeStampIntervalProviderCircuitProof],
            method: proofAttachSourcedTimestampinterval,
        }, 

        increaseTimeStampInterval: {
            privateInputs: [GeoPointWithTimeStampIntervalInPolygonCommitment, TimeStampInterval],
            method: expandTimeStampInterval,
        },

        increaseTimeStampIntervalRecursive: {
            privateInputs: [SelfProof<Empty, GeoPointWithTimeStampIntervalInPolygonCommitment>, TimeStampInterval],
            method: expandTimeStampIntervalRecursive,
        },

        AND: {
            privateInputs: [
                (SelfProof<Empty, GeoPointWithTimeStampIntervalInPolygonCommitment>),
                (SelfProof<Empty, GeoPointWithTimeStampIntervalInPolygonCommitment>),
            ],
            method: geoPointWithTimeStampInPolygonAND,
        },

        OR: {
            privateInputs: [
                (SelfProof<Empty, GeoPointWithTimeStampIntervalInPolygonCommitment>),
                (SelfProof<Empty, GeoPointWithTimeStampIntervalInPolygonCommitment>),
            ],
            method: geoPointWithTimeStampInPolygonOR,
        },
    },
});

// TODO: review if below is needed, and delete if not
export const GeoPointInOrOutOfPolygonCircuit = Experimental.ZkProgram({
    publicOutput: GeoPointPolygonInclusionExclusionProof,

    methods: {
        fromCoordinatesInPolygonProof: {
            privateInputs: [(SelfProof<Empty, GeoPointInPolygonCommitment>)],
            method: fromCoordinatesInPolygonProof,
        },
        combine: {
            privateInputs: [
                (SelfProof<Empty, GeoPointPolygonInclusionExclusionProof>),
                (SelfProof<Empty, GeoPointPolygonInclusionExclusionProof>),
            ],
            method: combine,
        },
    },
});
