import { Poseidon, Bool, Provable, Int64, Field } from "o1js";
import { isPointOnEdgeProvable } from './Geography';
import { Int64Prover } from "../math/Provers.js";
import { CoordinatePolygonInclusionExclusionProof, CoordinateInPolygonCommitment } from "../model/Commitment";
function isPointIn3PointPolygon(point, polygon) {
    const x = point.point.latitude;
    const y = point.point.longitude;
    let vertices = [
        polygon.vertice1,
        polygon.vertice2,
        polygon.vertice3,
    ];
    let inside = Bool(false);
    const isPointOnEdge1 = isPointOnEdgeProvable(point, polygon.vertice1, polygon.vertice2);
    const isPointOnEdge2 = isPointOnEdgeProvable(point, polygon.vertice2, polygon.vertice3);
    const isPointOnEdge3 = isPointOnEdgeProvable(point, polygon.vertice3, polygon.vertice1);
    const isPointLocatedOnEdge = isPointOnEdge1.or(isPointOnEdge2).or(isPointOnEdge3);
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].latitude;
        const yi = vertices[i].longitude;
        const xj = vertices[j].latitude;
        const yj = vertices[j].longitude;
        const condition1 = Int64Prover.provableIsInt64XGreaterThanY(yi, y);
        const condition2 = Int64Prover.provableIsInt64XGreaterThanY(yj, y);
        const jointCondition1 = Provable.if(condition1.equals(condition2), Bool(true), Bool(false)).not();
        Provable.log('xj:', xj);
        Provable.log('xi:', xi);
        Provable.log('yj:', yj);
        Provable.log('yi:', yi);
        const leftOperand = xj.sub(xi);
        const rightOperand = y.sub(yi);
        Provable.log('xj.sub(xi):', leftOperand, leftOperand.magnitude, leftOperand.sgn);
        Provable.log('y.sub(yi):', rightOperand, rightOperand.magnitude, rightOperand.sgn);
        const magnitudeProduct = leftOperand.magnitude.mul(rightOperand.magnitude);
        const signProduct = leftOperand.sgn.mul(rightOperand.sgn);
        Provable.log('magnitudeProduct:', magnitudeProduct);
        Provable.log('signProduct:', signProduct, signProduct.value, signProduct.isPositive());
        const numerator = leftOperand.mul(rightOperand);
        Provable.log('numerator: ', numerator);
        let denominator = yj.sub(yi);
        Provable.log('denominator: ', denominator);
        // Horizontal Edge case: ensure that division by zero does not occur
        const isHorizontalEdge = Int64Prover.provableIsInt64XEqualToZero(denominator);
        denominator = Provable.if(isHorizontalEdge, Int64.one, denominator);
        const result_before_addition = numerator.div(denominator);
        const result = result_before_addition.add(xi);
        let jointCondition2 = Int64Prover.provableIsInt64XLessThanY(x, result);
        // Horizontal Edge case: this will skip the horizontal edge checks
        jointCondition2 = Provable.if(isHorizontalEdge, Bool(false), jointCondition2);
        const isIntersect = Provable.if(jointCondition1.and(jointCondition2), Bool(true), Bool(false));
        inside = Provable.if(isIntersect, inside.not(), inside);
        Provable.log('------------------');
        Provable.log('i: ', i, ' j: ', j);
        Provable.log('x: ', x, ' y: ', y, 'result: ', result, ' inside: ', inside);
        Provable.log('jointCondition1: ', jointCondition1);
        Provable.log('jointCondition2: ', jointCondition2);
        Provable.log('isIntersect: ', isIntersect);
        Provable.log('------------------');
    }
    inside = Provable.if(isPointLocatedOnEdge, Bool(true), inside);
    return inside;
}
export function proveCoordinatesIn3PointPolygon(point, polygon) {
    // TODO: IT IS CRUCIAL TO VERIFY THAT THE FACTOR OF THE POINT IS THE SAME
    // AS THE FACTOR OF ALL OF THE POINTS OF THE POLYGON. Oterwise, the math
    // will fail. Consider implementing this check as another proof.
    // The argument could be a proof that returns a struct that contains both
    // of the values provided as arguments. That proof should also validate
    // that the provided latitude and longitude values are within the accepted
    // values.
    Provable.log('Proving that point is in polygon...');
    const isInPolygon = isPointIn3PointPolygon(point, polygon);
    Provable.log('Is in Polygon ', isInPolygon);
    // If point in polygon, return the commitment data
    const polygonCommitment = polygon.hash();
    const coordinatesCommitment = point.hash();
    Provable.log('Polygon Commitment: ', polygonCommitment);
    Provable.log('Coordinates Commitment: ', coordinatesCommitment);
    Provable.log('Is In Polygon: ', isInPolygon);
    return new CoordinateInPolygonCommitment({
        polygonCommitment: polygonCommitment,
        coordinatesCommitment: coordinatesCommitment,
        isInPolygon: isInPolygon,
    });
}
/**
 * Given two proofs, it combines them into a single proof that is the AND of the two proofs.
 * The AND operand is applied to the `isInPolygon` field of the two proofs. The proof is computed
 * even if neither of the proofs have `isInPolygon` set to true. The proof verifies that the
 * `coordinatesCommitment` are the same, and that the `polygonCommitment` are different.
 * @param proof1 - the first proof
 * @param proof2  - the second proof
 * @returns CoordinateProofState
 */
export function AND(proof1, proof2) {
    // IMPORTANT: this has an issue. If I give proof1, which asserts that the user is in Spain, and proof2 that
    // asserts that the user is not in Romania, then the resulting proof from .AND will say that the user is
    // neither in Spain, nor Romania. This is because the AND operation is applied to the `isInPolygon` field
    // of the two proofs. This is not the desired behaviour. The desired behaviour is to have a proof that
    // asserts that the user is in Spain AND is not in Romania.
    // For correctness, this method/proof should opearate ensuring that the values of `isInPolygon` is the same
    // in both proofs: either both are true, or both are false. If they are different, then the proof should
    // fail. This way the proof will attest to either the user being inside a set of polygons, or outside of that set.
    // A good solution for this appears to be to separate proofs. The proofs in CoordinatesInPolygon should only attest to
    // either the presence or the abcense of the user from a polygon, or a set of polygons. Simple polygons are combined
    // into more complex shapes using the AND and OR operations. There should be another ZKProgram, that takes as input
    // a set of proofs from CoordinatesInPolygon ZKProgram, checks their isInPolygon values, and then combines them
    // into another proof whose public output includes a commitment to the polygons in which the user is in, and
    // to the polygons in which the user is not. Wether this should be implemented or not should be carefully considered.
    // It's important to note, that the existing system can be combined to achieve the same result, but it may not be as
    // convenient as having a single proof that attests to the presence or absence of the user from a set of polygons.
    // Proving that you are in Romania or Spain, means proving that you are NOT in the rest of the world.
    // The additional ZKProgram described above can be implemented as an additional feature. It can be considered
    // as a nice to have. The new ZKProgram would accept two proofs which have CoordinateProofState as their public output,
    // and combine them into a public output which whould add all of the `isInPolygon=True` polygons to `insidePolygonCommitment`,
    // and all of the `isInPolygon=False` polygons to `outsidePolygonCommitment`. The new ZKProgram would also verify that
    // the `coordinatesCommitment` of the two proofs are the same, and that the `polygonCommitment` are different.
    proof1.verify();
    proof2.verify();
    // ensure that the proof is for the same coordinates
    proof1.publicOutput.coordinatesCommitment.assertEquals(proof2.publicOutput.coordinatesCommitment);
    // NOTE: see note below on .OR
    // ensure that the proof is not done for the same polygon
    //proof1.publicOutput.polygonCommitment.assertNotEquals(
    // proof2.publicOutput.polygonCommitment
    //);
    // ensure that the proofs are either both for isInPolygon, or both not for isInPolygon
    const isInPolygon = proof1.publicOutput.isInPolygon.and(proof2.publicOutput.isInPolygon);
    return new CoordinateInPolygonCommitment({
        polygonCommitment: Poseidon.hash([
            proof1.publicOutput.polygonCommitment,
            proof2.publicOutput.polygonCommitment,
        ]),
        coordinatesCommitment: proof1.publicOutput.coordinatesCommitment,
        isInPolygon: isInPolygon,
    });
}
/**
 * Given two proofs, it combines them into a single proof that is the OR of the two proofs.
 * The OR operand is applied to the `isInPolygon` field of the two proofs. The proof is computed
 * even if neither of the proofs have `isInPolygon` set to true. The proof verifies that the
 * `coordinatesCommitment` are the same, and that the `polygonCommitment` are different.
 * @param proof1 - the first proof
 * @param proof2 - the second proof
 * @returns CoordinateProofState
 */
export function OR(proof1, proof2) {
    proof1.verify();
    proof2.verify();
    // ensure that the proof is for the same coordinates
    proof1.publicOutput.coordinatesCommitment.assertEquals(proof2.publicOutput.coordinatesCommitment);
    // NOTE: I have decided to forego for this check, as there could be a use-case for combining
    // different location proofs about the same polygon, as the proofs could have different coordinate
    // sources. This would allow for the end-user to combine proofs about the same polygon, but from
    // different sources. For example, a user could combine a proof from a GPS sensor, with a proof
    // from a cell tower, and a proof from a WiFi hotspot. This would allow for the end-user to
    // combine proofs from different sources, and achieve a higher level of confidence that they
    // are inside or outside of the polygon. The decision on whether the to trust the coordinate sources
    // or not is left to the receiving party.
    // ensure that the proof is not done for the same polygon
    //proof1.publicOutput.polygonCommitment.assertNotEquals(
    //  proof2.publicOutput.polygonCommitment
    //);
    // logic of OR
    let isInPolygon = Provable.if(proof1.publicOutput.isInPolygon.or(proof2.publicOutput.isInPolygon), Bool(true), Bool(false));
    return new CoordinateInPolygonCommitment({
        polygonCommitment: Poseidon.hash([
            proof1.publicOutput.polygonCommitment,
            proof2.publicOutput.polygonCommitment,
        ]),
        coordinatesCommitment: proof1.publicOutput.coordinatesCommitment,
        isInPolygon: isInPolygon,
    });
}
export function combine(proof1, proof2) {
    proof1.verify();
    proof2.verify();
    const proof1PublicOutput = proof1.publicOutput;
    const proof2PublicOutput = proof2.publicOutput;
    // ensure that the proof is for the same coordinates
    proof1.publicOutput.coordinatesCommitment.assertEquals(proof2.publicOutput.coordinatesCommitment);
    // Ensure that we are not combining identical proofs. An identical proof
    // is a proof that commits to the samae inside and outside polygon commitments
    const isInsidePolygonCommitmentEqual = Provable.if(proof1PublicOutput.insidePolygonCommitment.equals(proof2PublicOutput.insidePolygonCommitment), Bool(true), Bool(false));
    const isOutsidePolygonCommitmentEqual = Provable.if(proof1PublicOutput.outsidePolygonCommitment.equals(proof2PublicOutput.outsidePolygonCommitment), Bool(true), Bool(false));
    // this will only fail the assertion, if both, the inside and outside polygon commitments are equal
    isInsidePolygonCommitmentEqual
        .and(isOutsidePolygonCommitmentEqual)
        .assertEquals(Bool(false));
    const isInsideCommitmentPresentInProof1 = Provable.if(proof1PublicOutput.insidePolygonCommitment.equals(Field(0)), Bool(false), Bool(true));
    const isInsideCommitmentPresentInProof2 = Provable.if(proof2PublicOutput.insidePolygonCommitment.equals(Field(0)), Bool(false), Bool(true));
    const isOutsideCommitmentPresentInProof1 = Provable.if(proof1PublicOutput.outsidePolygonCommitment.equals(Field(0)), Bool(false), Bool(true));
    const isOutsideCommitmentPresentInProof2 = Provable.if(proof2PublicOutput.outsidePolygonCommitment.equals(Field(0)), Bool(false), Bool(true));
    // Inside commitments of Proof1 and Proof2 should only be combined if they're non-zero. Here is how the value of the combined inside commitment is calculated:
    // * Proof1's and Proof2's inside commitments are non-Field(0): Poseidon.hash([Proof1, Proof2])
    // * Proof1==Field(0) and Proof2!=Field(0): Proof2
    // * Proof1!=Field(0) and Proof2==Field(0): Proof1
    // * Proof1==Field(0) and Proof2==Field(0): Field(0)
    // First, compute the joint hash, in case both of the fields are provided
    const newInsideCommitmentBothPresent = Poseidon.hash([
        proof1PublicOutput.insidePolygonCommitment,
        proof2PublicOutput.insidePolygonCommitment,
    ]);
    // Now, iteratively build up ot the final hash. The idea is to start with an assumption that both proofs were provided. After that,
    // we ensure that hte assumption is correct by verifying the other conditions. The answer is only altered if one of the
    // conditions sets a new reality.
    // 1. If only proof1 is present, set to the value of proof1, otherwise, joint proof
    let newInsideCommitment = Provable.if(isInsideCommitmentPresentInProof1.and(isInsideCommitmentPresentInProof2.not()), proof1PublicOutput.insidePolygonCommitment, newInsideCommitmentBothPresent);
    // 2. Only change the value of the commitment if proof1 is not presen and proof2 is present
    newInsideCommitment = Provable.if(isInsideCommitmentPresentInProof1
        .not()
        .and(isInsideCommitmentPresentInProof2), proof2PublicOutput.insidePolygonCommitment, newInsideCommitment);
    // 3. Only set the commitemnt explicitly to Field(0) if neither proof1, nor proof2 were provided
    newInsideCommitment = Provable.if(isInsideCommitmentPresentInProof1
        .not()
        .and(isInsideCommitmentPresentInProof2.not()), Field(0), newInsideCommitment);
    const newOutsideCommitmentBothPresent = Poseidon.hash([
        proof1PublicOutput.outsidePolygonCommitment,
        proof2PublicOutput.outsidePolygonCommitment,
    ]);
    let newOutsideCommitment = Provable.if(isOutsideCommitmentPresentInProof1.and(isOutsideCommitmentPresentInProof2.not()), proof1PublicOutput.outsidePolygonCommitment, newOutsideCommitmentBothPresent);
    newOutsideCommitment = Provable.if(isOutsideCommitmentPresentInProof1
        .not()
        .and(isInsideCommitmentPresentInProof2), proof2PublicOutput.outsidePolygonCommitment, newOutsideCommitment);
    newInsideCommitment = Provable.if(isInsideCommitmentPresentInProof1
        .not()
        .and(isInsideCommitmentPresentInProof2.not()), Field(0), newOutsideCommitment);
    return new CoordinatePolygonInclusionExclusionProof({
        insidePolygonCommitment: newInsideCommitment,
        outsidePolygonCommitment: newOutsideCommitment,
        coordinatesCommitment: proof1PublicOutput.coordinatesCommitment,
    });
}
export function fromCoordinatesInPolygonProof(proof) {
    proof.verify();
    const coodinatesInPolygonProof = proof.publicOutput;
    const insideCommitment = Provable.if(coodinatesInPolygonProof.isInPolygon, coodinatesInPolygonProof.polygonCommitment, Field(0));
    const outsideCommitment = Provable.if(coodinatesInPolygonProof.isInPolygon, Field(0), coodinatesInPolygonProof.polygonCommitment);
    return new CoordinatePolygonInclusionExclusionProof({
        insidePolygonCommitment: insideCommitment,
        outsidePolygonCommitment: outsideCommitment,
        coordinatesCommitment: coodinatesInPolygonProof.coordinatesCommitment,
    });
}
//# sourceMappingURL=Methods.js.map