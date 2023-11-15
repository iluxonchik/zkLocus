import { SelfProof, Empty } from "o1js";
import { NoncedGeographicalPoint, ThreePointPolygon } from '../model/Geography';
import { CoordinatePolygonInclusionExclusionProof, CoordinateInPolygonCommitment } from "../model/Commitment";
export declare function proveGeoPointIn3PointPolygon(point: NoncedGeographicalPoint, polygon: ThreePointPolygon): CoordinateInPolygonCommitment;
/**
 * Given two proofs, it combines them into a single proof that is the AND of the two proofs.
 * The AND operand is applied to the `isInPolygon` field of the two proofs. The proof is computed
 * even if neither of the proofs have `isInPolygon` set to true. The proof verifies that the
 * `coordinatesCommitment` are the same, and that the `polygonCommitment` are different.
 * @param proof1 - the first proof
 * @param proof2  - the second proof
 * @returns CoordinateProofState
 */
export declare function AND(proof1: SelfProof<Empty, CoordinateInPolygonCommitment>, proof2: SelfProof<Empty, CoordinateInPolygonCommitment>): CoordinateInPolygonCommitment;
/**
 * Given two proofs, it combines them into a single proof that is the OR of the two proofs.
 * The OR operand is applied to the `isInPolygon` field of the two proofs. The proof is computed
 * even if neither of the proofs have `isInPolygon` set to true. The proof verifies that the
 * `coordinatesCommitment` are the same, and that the `polygonCommitment` are different.
 * @param proof1 - the first proof
 * @param proof2 - the second proof
 * @returns CoordinateProofState
 */
export declare function OR(proof1: SelfProof<Empty, CoordinateInPolygonCommitment>, proof2: SelfProof<Empty, CoordinateInPolygonCommitment>): CoordinateInPolygonCommitment;
export declare function combine(proof1: SelfProof<Empty, CoordinatePolygonInclusionExclusionProof>, proof2: SelfProof<Empty, CoordinatePolygonInclusionExclusionProof>): CoordinatePolygonInclusionExclusionProof;
export declare function fromCoordinatesInPolygonProof(proof: SelfProof<Empty, CoordinateInPolygonCommitment>): CoordinatePolygonInclusionExclusionProof;
