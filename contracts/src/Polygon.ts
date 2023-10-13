import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Struct,
  Poseidon,
  Bool,
  Experimental,
  SelfProof,
  Empty,
  Provable,
} from 'o1js';

export class GeographicalPoint extends Struct({
  latitude: Field,
  longitude: Field,
}) {
  hash() {
    return Poseidon.hash([this.latitude, this.longitude]);
  }
}

export class NoncedGeographicalPoint extends Struct({
  point: GeographicalPoint,
  nonce: Field,
}) {
  hash() {
    return Poseidon.hash([this.point.hash(), this.nonce]);
  }
}

export class ThreePointPolygon extends Struct({
  vertice1: GeographicalPoint,
  vertice2: GeographicalPoint,
  vertice3: GeographicalPoint,
}) {
  hash() {
    return Poseidon.hash([
      this.vertice1.hash(),
      this.vertice2.hash(),
      this.vertice3.hash(),
    ]);
  }
}

class CoordinateProofState extends Struct({
  polygonCommitment: Field,
  // TODO: consider including outSidePolygonCommitment proofs, in order to inlcude the "inner" and "outer" polygon definitions of GeoJSON
  //outsidePolygonCommitment: Field,
  coordinatesCommitment: Field, // IMPORTANT: without a nonce, this leaks the coordinates
  isInPolygon: Bool,
}) {
  toString(): string {
    return `Polygon Commitment: ${this.polygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}\nIs In Polygon: ${this.isInPolygon.toString()}`;
  }
}

class CoordinatePolygonInclusionExclusionProof extends Struct({
  insidePolygonCommitment: Field,
  outsidePolygonCommitment: Field,
  coordinatesCommitment: Field,
}) {
  toString(): string {
    return `Inside Polygon Commitment: ${this.insidePolygonCommitment.toString()}\nOutside Polygon Commitment: ${this.outsidePolygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}`;
  }
}

function isPointIn3PointPolygon(
  point: NoncedGeographicalPoint,
  polygon: ThreePointPolygon
): Bool {
  const x: Field = point.point.latitude;
  const y: Field = point.point.longitude;

  let vertices: Array<GeographicalPoint> = [
    polygon.vertice1,
    polygon.vertice2,
    polygon.vertice3,
  ];
  let inside: Bool = Bool(false);

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].latitude;
    const yi = vertices[i].longitude;
    const xj = vertices[j].latitude;
    const yj = vertices[j].longitude;

    const condition1: Bool = Provable.if(
      yi.greaterThan(y),
      Bool(true),
      Bool(false)
    );
    const condition2: Bool = Provable.if(
      yj.greaterThan(y),
      Bool(true),
      Bool(false)
    );
    const jointCondition1: Bool = Provable.if(
      condition1.equals(condition2),
      Bool(true),
      Bool(false)
    );

    const numerator: Field = xj.sub(xi).mul(y.sub(yi));
    const denominator: Field = yj.sub(yi).add(xi);

    // NOTE: adapt zero check?
    denominator.assertNotEquals(Field(0));

    const result: Field = numerator.div(denominator);

    const jointCondition2: Bool = Provable.if(
      x.lessThan(result),
      Bool(true),
      Bool(false)
    );
    const isIntersect: Bool = Provable.if(
      jointCondition1.and(jointCondition2),
      Bool(true),
      Bool(false)
    );

    inside = Provable.if(isIntersect, inside.not(), inside);
  }

  return inside;
}

function proveCoordinatesIn3PointPolygon(
  point: NoncedGeographicalPoint,
  polygon: ThreePointPolygon
): CoordinateProofState {
  const isInPolygon: Bool = isPointIn3PointPolygon(point, polygon);

  Provable.log('Is in Polygon ', isInPolygon);

  // If point in polygon, return the commitment data
  const polygonCommitment = polygon.hash();
  const coordinatesCommitment = point.hash();

  Provable.log('Polygon Commitment: ', polygonCommitment);
  Provable.log('Coordinates Commitment: ', coordinatesCommitment);
  Provable.log('Is In Polygon: ', isInPolygon);

  return new CoordinateProofState({
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
function AND(
  proof1: SelfProof<Empty, CoordinateProofState>,
  proof2: SelfProof<Empty, CoordinateProofState>
): CoordinateProofState {

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
  proof1.publicOutput.coordinatesCommitment.assertEquals(
    proof2.publicOutput.coordinatesCommitment
  );
 
  // ensure that the proof is not done for the same polygon
  proof1.publicOutput.polygonCommitment.assertNotEquals(
    proof2.publicOutput.polygonCommitment
  );

  // ensure that the proofs are either both for isInPolygon, or both not for isInPolygon
  let expectedSecondProofIsInPolygon = Provable.if(
    proof1.publicOutput.isInPolygon,
    Bool(true),
    Bool(false)
  );

  expectedSecondProofIsInPolygon.assertEquals(proof2.publicOutput.isInPolygon);

  
  return new CoordinateProofState({
    polygonCommitment: Poseidon.hash([
      proof1.publicOutput.polygonCommitment,
      proof2.publicOutput.polygonCommitment,
    ]),
    coordinatesCommitment: proof1.publicOutput.coordinatesCommitment,
    isInPolygon: expectedSecondProofIsInPolygon,
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
function OR(
  proof1: SelfProof<Empty, CoordinateProofState>,
  proof2: SelfProof<Empty, CoordinateProofState>,
): CoordinateProofState {
  proof1.verify();
  proof2.verify();

  // ensure that the proof is for the same coordinates
  proof1.publicOutput.coordinatesCommitment.assertEquals(
    proof2.publicOutput.coordinatesCommitment
  );
  // ensure that the proof is not done for the same polygon
  proof1.publicOutput.polygonCommitment.assertNotEquals(
    proof2.publicOutput.polygonCommitment
  );

  // logic of OR
  let isInPolygon = Provable.if(
    proof1.publicOutput.isInPolygon.or(proof2.publicOutput.isInPolygon),
    Bool(true),
    Bool(false)
  );

  return new CoordinateProofState({
    polygonCommitment: Poseidon.hash([
      proof1.publicOutput.polygonCommitment,
      proof2.publicOutput.polygonCommitment,
    ]),
    coordinatesCommitment: proof1.publicOutput.coordinatesCommitment,
    isInPolygon: isInPolygon,
  });
}

export const CoordinatesInPolygon = Experimental.ZkProgram({
  publicOutput: CoordinateProofState,

  methods: {
    proveCoordinatesIn3PointPolygon: {
      privateInputs: [NoncedGeographicalPoint, ThreePointPolygon],
      method: proveCoordinatesIn3PointPolygon,
    },

    AND: {
      privateInputs: [
        SelfProof<Empty, CoordinateProofState>,
        SelfProof<Empty, CoordinateProofState>,
      ],
      method: AND,
    },

    OR: {
      privateInputs: [
        SelfProof<Empty, CoordinateProofState>,
        SelfProof<Empty, CoordinateProofState>,
      ],
      method: OR,
    },
  },
});


function fromCoordinatesInPolygonProof(
  proof: SelfProof<Empty, CoordinateProofState>
): CoordinatePolygonInclusionExclusionProof {
  proof.verify();
  
  const coodinatesInPolygonProof: CoordinateProofState = proof.publicOutput;
  const insideCommitment = Provable.if(coodinatesInPolygonProof.isInPolygon, coodinatesInPolygonProof.polygonCommitment, Field(0));
  const outsideCommitment = Provable.if(coodinatesInPolygonProof.isInPolygon, Field(0), coodinatesInPolygonProof.polygonCommitment);

  return new CoordinatePolygonInclusionExclusionProof({
    insidePolygonCommitment: insideCommitment,
    outsidePolygonCommitment: outsideCommitment,
    coordinatesCommitment: coodinatesInPolygonProof.coordinatesCommitment,
  });
}

export const CoordinatesInOrOutOfPolygon = Experimental.ZkProgram({
  // TODO: consider a public input, instead of public output?
  // If so, the public input can be CoordinateProofState, and then I'll have
  // another ZKProgram that combines multiple CoordinatesInOrOutOfPolygon.
  publicOutput: CoordinatePolygonInclusionExclusionProof,

  methods: {
    fromCoordinatesInPolygonProof: {
      privateInputs: [
        SelfProof<Empty, CoordinateProofState>,
      ],
      method: fromCoordinatesInPolygonProof,
    }
  }
})

/**
 * Represents the history of locations. The history of locations is composed of proofs from `LocationInPolygon`.
 * All of the histoircal data and assertions about the lcoation are performed here.
 *
 * This is a "public" proof, meaning it is stored on the blockchain.
 */
export class LocationHistorySC extends SmartContract {
  @state(Field) merkleRoot = State<Field>();

  @method init() {
    super.init();
    this.merkleRoot.set(Field(0));
  }
}
