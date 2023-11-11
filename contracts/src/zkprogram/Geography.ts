import { Experimental, SelfProof, Empty } from "o1js";
import { proveCoordinatesIn3PointPolygon, AND, OR } from '../logic/Methods';

import { CoordinatePolygonInclusionExclusionProof, CoordinateProofState } from '../model/Commitment';
import { NoncedGeographicalPoint, ThreePointPolygon } from '../model/Geography';
import { fromCoordinatesInPolygonProof } from '../logic/Methods';
import { combine } from '../logic/Methods';


export const CoordinatesInPolygon = Experimental.ZkProgram({
    publicOutput: CoordinateProofState,

    methods: {
        proveCoordinatesIn3PointPolygon: {
            privateInputs: [NoncedGeographicalPoint, ThreePointPolygon],
            method: proveCoordinatesIn3PointPolygon,
        },

        AND: {
            privateInputs: [
                (SelfProof<Empty, CoordinateProofState>),
                (SelfProof<Empty, CoordinateProofState>),
            ],
            method: AND,
        },

        OR: {
            privateInputs: [
                (SelfProof<Empty, CoordinateProofState>),
                (SelfProof<Empty, CoordinateProofState>),
            ],
            method: OR,
        },
    },
});

export const CoordinatesInOrOutOfPolygon = Experimental.ZkProgram({
    publicOutput: CoordinatePolygonInclusionExclusionProof,

    methods: {
        fromCoordinatesInPolygonProof: {
            privateInputs: [(SelfProof<Empty, CoordinateProofState>)],
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
