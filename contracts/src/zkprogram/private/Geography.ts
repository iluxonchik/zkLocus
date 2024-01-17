import { ZkProgram} from "o1js";
import { geoPointFromLiteral, timeStampIntervalFromLiteral, exactGeoPointFromOracle} from '../../logic/Methods';

import { GeoPoint} from '../../model/Geography';
import { TimeStampInterval } from "../../model/Time";
import { OracleGeoPointProviderCircuitProof } from "./Oracle";


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
    name: "GeoPoint Provider Circuit",
    publicInput: undefined,
    publicOutput: GeoPoint,

    methods: {
        fromLiteralGeoPoint: {
            privateInputs: [GeoPoint],
            method: geoPointFromLiteral,
        },

        fromOracle: {
            privateInputs: [OracleGeoPointProviderCircuitProof, GeoPoint],
            method: exactGeoPointFromOracle,
        },

    },
});

export class GeoPointProviderCircuitProof extends ZkProgram.Proof(GeoPointProviderCircuit) {}

/**
 * Set of ZK circuits that allow for the creation of a proof attesting to the validity of a timestamp interval.
 * 
 * The output of this should be as an input to `GeoPointWithTimestampInPolygon`.
 */
export const TimeStampIntervalProviderCircuit = ZkProgram({
    name: "TimeStampIntervalProviderCircuit",
    publicOutput: TimeStampInterval,

    methods: {
        fromLiteral: {
            privateInputs: [TimeStampInterval],
            method: timeStampIntervalFromLiteral,
        },
    },
});


export class TimeStampIntervalProviderCircuitProof extends ZkProgram.Proof(TimeStampIntervalProviderCircuit) {}
