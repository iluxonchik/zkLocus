import { ZkProgram } from "o1js";
import { AND, OR, proveProvidedGeoPointIn3PointPolygon } from '../../logic/Methods';
import { GeoPointInPolygonCommitment } from '../../model/private/Commitment';
import { ThreePointPolygon } from '../../model/Geography';
import { GeoPointProviderCircuitProof } from "./Geography";

/**
 * Set of ZK circuts responsible for verifying that a geographical point is within a polygon,
 * and contains the logic for combining multiple proofs into a single one.
 *
 * The source of the geographical point is attested by the proof from where the point is sourced.
 */

export const GeoPointInPolygonCircuit = ZkProgram({
    name: "Geo Point In Polygon Circuit",
    publicInput: undefined,
    publicOutput: GeoPointInPolygonCommitment,

    methods: {
        proveGeoPointIn3PointPolygon: {
            privateInputs: [GeoPointProviderCircuitProof, ThreePointPolygon],
            method: proveProvidedGeoPointIn3PointPolygon,
        },
    },
});


export class GeoPointInPolygonCircuitProof extends ZkProgram.Proof(GeoPointInPolygonCircuit) { }

export const GeoPointInPolygonCombinerCircuit = ZkProgram({
    name: "Geo Point In Polygon Combiner Circuit",

    publicOutput: GeoPointInPolygonCommitment,

    methods: {
        AND: {
            privateInputs: [
                GeoPointInPolygonCircuitProof,
                GeoPointInPolygonCircuitProof,
            ],
            method: AND,
        },

        OR: {
            privateInputs: [
                GeoPointInPolygonCircuitProof,
                GeoPointInPolygonCircuitProof,
            ],
            method: OR,
        },
    },
});

export class GeoPointInPolygonCombinerCircuitProof extends ZkProgram.Proof(GeoPointInPolygonCombinerCircuit) { }

