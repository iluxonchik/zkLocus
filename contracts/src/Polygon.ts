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
  coordinatesCommitment: Field,
  isInPolygon: Bool,
}) {
  toString(): string {
    return `Polygon Commitment: ${this.polygonCommitment.toString()}\nCoordinates Commitment: ${this.coordinatesCommitment.toString()}\nIs In Polygon: ${this.isInPolygon.toString()}`;
  }
}

function proveCoordinatesIn3PointPolygon(
  point: GeographicalPoint,
  polygon: ThreePointPolygon
): CoordinateProofState {
  // compute if point in Polygon
  // NOTE: fow now, using this mock impelementation: if the sum of the coordinates is greater than 100, it's inside,
  // otherwise, it's outside.
  let sumOfCoordinates: Field = point.latitude.add(point.longitude);

  Provable.log('Sum Of Coordinates: ', sumOfCoordinates);

  let isGreaterThan100: Bool = Provable.if(
    sumOfCoordinates.greaterThan(Field(100)),
    Bool(true),
    Bool(false)
  );

  Provable.log('Is Greater Than 100: ', isGreaterThan100);

  // If point in polygon, return the commitment data
  let polygonCommitment = polygon.hash();
  let coordinatesCommitment = point.hash();
  let isInPolygon = isGreaterThan100;

  Provable.log('Polygon Commitment: ', polygonCommitment);
  Provable.log('Coordinates Commitment: ', coordinatesCommitment);
  Provable.log('Is In Polygon: ', isInPolygon);

  return new CoordinateProofState({
    polygonCommitment: polygonCommitment,
    coordinatesCommitment: coordinatesCommitment,
    isInPolygon: isInPolygon,
  });
}

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
  proof1.publicOutput.polygonCommitment.assertNotEquals(
    proof2.publicOutput.polygonCommitment
  );

  // logic of AND
  let isInPolygon = Provable.if(
    proof1.publicOutput.isInPolygon.and(proof2.publicOutput.isInPolygon),
    Bool(true),
    Bool(false)
  );

  isInPolygon.assertEquals(Bool(true));
  return new CoordinateProofState({
    polygonCommitment: Poseidon.hash([
      proof1.publicOutput.polygonCommitment,
      proof2.publicOutput.polygonCommitment,
    ]),
    coordinatesCommitment: proof1.publicOutput.coordinatesCommitment,
    isInPolygon: Bool(true),
  });
}

function OR(
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
  proof1.publicOutput.polygonCommitment.assertNotEquals(
    proof2.publicOutput.polygonCommitment
  );

  // logic of OR
  let isInPolygon = Provable.if(
    proof1.publicOutput.isInPolygon.or(proof2.publicOutput.isInPolygon),
    Bool(true),
    Bool(false)
  );

  isInPolygon.assertEquals(Bool(true));

  return new CoordinateProofState({
    polygonCommitment: Poseidon.hash([
      proof1.publicOutput.polygonCommitment,
      proof2.publicOutput.polygonCommitment,
    ]),
    coordinatesCommitment: proof1.publicOutput.coordinatesCommitment,
    isInPolygon: Bool(true),
  });
}

export const CoordinatesInPolygon = Experimental.ZkProgram({
  publicOutput: CoordinateProofState,

  methods: {
    proveCoordinatesIn3PointPolygon: {
      privateInputs: [GeographicalPoint, ThreePointPolygon],
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
