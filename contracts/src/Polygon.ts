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
  insidePolygonCommitment: Field,
  // TODO: consider including outSidePolygonCommitment proofs, in order to inlcude the "inner" and "outer" polygon definitions of GeoJSON
  //outsidePolygonCommitment: Field,
  coordinatesCommitment: Field, // IMPORTANT: without a nonce, this leaks the coordinates
  isInPolygon: Bool,
}) {
  toString(): string {
    return `Polygon Commitment: ${this.insidePolygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}\nIs In Polygon: ${this.isInPolygon.toString()}`;
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
  const insidePolygonCommitment = polygon.hash();
  const coordinatesCommitment = point.hash();

  Provable.log('Polygon Commitment: ', insidePolygonCommitment);
  Provable.log('Coordinates Commitment: ', coordinatesCommitment);
  Provable.log('Is In Polygon: ', isInPolygon);

  return new CoordinateProofState({
    insidePolygonCommitment: insidePolygonCommitment,
    coordinatesCommitment: coordinatesCommitment,
    isInPolygon: isInPolygon,
  });
}

/**
 * Given two proofs, it combines them into a single proof that is the AND of the two proofs.
 * The AND operand is applied to the `isInPolygon` field of the two proofs. The proof is computed
 * even if neither of the proofs have `isInPolygon` set to true. The proof verifies that the
 * `coordinatesCommitment` are the same, and that the `insidePolygonCommitment` are different.
 * @param proof1 - the first proof
 * @param proof2  - the second proof
 * @returns CoordinateProofState
 */
function AND(
  proof1: SelfProof<Empty, CoordinateProofState>,
  proof2: SelfProof<Empty, CoordinateProofState>
): CoordinateProofState {
  proof1.verify();
  proof2.verify();

  // ensure that the proof is for the same coordinates
  proof1.publicOutput.coordinatesCommitment.assertEquals(
    proof2.publicOutput.coordinatesCommitment
  );
  // ensure that the proof is not done for the same polygon
  proof1.publicOutput.insidePolygonCommitment.assertNotEquals(
    proof2.publicOutput.insidePolygonCommitment
  );

  // logic of AND
  let isInPolygon = Provable.if(
    proof1.publicOutput.isInPolygon.and(proof2.publicOutput.isInPolygon),
    Bool(true),
    Bool(false)
  );

  return new CoordinateProofState({
    insidePolygonCommitment: Poseidon.hash([
      proof1.publicOutput.insidePolygonCommitment,
      proof2.publicOutput.insidePolygonCommitment,
    ]),
    coordinatesCommitment: proof1.publicOutput.coordinatesCommitment,
    isInPolygon: isInPolygon,
  });
}

/**
 * Given two proofs, it combines them into a single proof that is the OR of the two proofs.
 * The OR operand is applied to the `isInPolygon` field of the two proofs. The proof is computed
 * even if neither of the proofs have `isInPolygon` set to true. The proof verifies that the
 * `coordinatesCommitment` are the same, and that the `insidePolygonCommitment` are different.
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
  proof1.publicOutput.insidePolygonCommitment.assertNotEquals(
    proof2.publicOutput.insidePolygonCommitment
  );

  // logic of OR
  let isInPolygon = Provable.if(
    proof1.publicOutput.isInPolygon.or(proof2.publicOutput.isInPolygon),
    Bool(true),
    Bool(false)
  );

  return new CoordinateProofState({
    insidePolygonCommitment: Poseidon.hash([
      proof1.publicOutput.insidePolygonCommitment,
      proof2.publicOutput.insidePolygonCommitment,
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
