import { SelfProof, Empty, ZkProgram } from "o1js";
import { expandTimeStampInterval, expandTimeStampIntervalRecursive } from '../../logic/Methods';
import { GeoPointWithTimeStampIntervalInPolygonCommitment } from '../../model/private/Commitment';
import { TimeStampInterval } from "../../model/Time";
import { geoPointWithTimeStampInPolygonAND, geoPointWithTimeStampInPolygonOR, proofAttachSourcedTimestampinterval } from "../../logic/Methods";
import { GeoPointInPolygonCircuitProof } from "./GeoPointInPolygonCircuit";
import { TimeStampIntervalProviderCircuitProof } from "./Geography";

/**
 * Set of ZK circuits responsible for attaching a timestamp to a GeoPoint in Polygon proof.
 * The source of the timestamp is attested by the proof from where the timestamp is sourced.
 *
 * The means by which the timestamp is attached to the GeoPoint in Polygon proof is by
 * adding the timestamp to the GeoPoint in Polygon proof's public output. This follows the
 * architectural approach that I have developed as a part of developing zkLocus, and it consists
 * of "attaching" data to a proof.
 * 
 *    IMPORTANT: This is a prototype, which was implemenented to demonstrate feasiablity.
 *         This is not a final implementation, and should not be used in production.
 */

export const GeoPointWithTimestampInPolygonCircuit = ZkProgram({
    name: "Geo Point With Timestamp In Polygon Circuit",
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
            privateInputs: [(SelfProof<Empty, GeoPointWithTimeStampIntervalInPolygonCommitment>), TimeStampInterval],
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
