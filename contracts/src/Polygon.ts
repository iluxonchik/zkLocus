import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Struct,
  Poseidon,
  Bool,
} from 'o1js';

class GeographicalPoint extends Struct({
  latitude: Field,
  longitude: Field,
}) {
  hash() {
    return Poseidon.hash([this.latitude, this.longitude]);
  }
}

class SimplePolygon extends Struct({
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

/**
 * Represents a proof that a geographical point is inside a polygon.
 *
 */
export class PolygonProof extends SmartContract {
  /** Hash of all of the fields composing the Polygon. */
  @state(Field) polygonCommitment = State<Field>();

  /**
   * Hash of the coordinates whose incluison inside of the Polygon is being verified
   * This is needed for the multi-polygon proof to verify that the assetions are related to the
   * same set of coordinates.
   */
  @state(Field) coordinatesCommitment = State<Field>();

  /** Hash of he source commitement of the Polygon. */
  @state(Field) sourceCommitment = State<Field>();

  /** Boolean indicating wether the point is to be included in the Polygon. */
  @state(Bool) isInPolygon = State<boolean>();

  /**
   * Initializes the PolygonProof smart contract.
   */
  @method init() {
    super.init();

    // Set default values for the state variables
    this.polygonCommitment.set(Field(0));
    this.coordinatesCommitment.set(Field(0));
    this.sourceCommitment.set(Field(0));
    this.isInPolygon.set(false);
  }
}

/**
 * Represents a proof that a geographical point is inside a polygon. This proof
 * can remain "private", i.e. local to the User's machine.
 */
export class CoordinatesInPolygon extends PolygonProof {
  /*
   * Proof that a geographical point is inside a simple polygon defied by 3 points.
   */
  @method proveCoordinatesIn3PointPolygon(
    point: GeographicalPoint,
    polygon: SimplePolygon
  ): Bool {
    // here, we verify if the point is in the polygon
    const hashOfGeoPoint = point.hash();
    const hashOfPolygon = polygon.hash();

    this.coordinatesCommitment.set(hashOfGeoPoint);
    this.polygonCommitment.set(hashOfPolygon);

    return Bool(true);
  }
}

class CoordinatesInPolygonProof extends CoordinatesInPolygon.Proof() {}

/*
 * Combines multiple PolygonProofs into a single proof that the coordinates are inside
 * at least one of the polygons. This proof can remain "private", i.e. local to the User's machine.
 * This Smart Contract allows to compose multiple ZK Proofs into a single one, by using the OR and AND
 * primitives.
 */
export class CoordinatesInMultiPolygon extends PolygonProof {
  @method ONLY(proof: CoordinatesInPolygonProof) {
    proof.verify();
    // 1. Verify that commintments have not been initialized yet
    this.polygonCommitment.assertEquals(Field(0));
    this.coordinatesCommitment.assertEquals(Field(0));
    this.sourceCommitment.assertEquals(Field(0));

    // 2. Set isInPolygon to proof.isInPolygon
    let isInPolygon: Bool = proof.publicOutput;
    this.isInPolygon.set(isInPolygon);
  }
  @method OR(proof: CoordinatesInPolygonProof) {
    proof.verify();
    // 1. Special case for init: If all commitements are Field(0), then accept polygon as valid
    //    ! - this has the edge case of the hashes causing a collision. Use an alternative, like a new boolean Field
    // 2. Verify that the commitment is for the same coordinates
    // 3. Update commitments
    // 4. Set isInPolygon to any(this.isInPolygon, proof.isInPolygon)
  }

  @method AND(proof: CoordinatesInPolygonProof) {
    proof.verify();
    // 1. Special case for init: If all commitements are Field(0), then accept polygon as valid
    //    ! - this has the edge case of the hashes causing a collision. Use an alternative, like a new boolean Field
    // 2. Verify that the commitment is for the same coordinates
    // 3. Update commitments
    // 4. Set isInPolygon to all(this.isInPolygon, proof.isInPolygon)
  }
}

class CoordinatesInMultiPolygonProof extends CoordinatesInMultiPolygon.Proof() {}

/**
 * Represents a proof that a geographical point is inside a polygon. This is the proof that will
 * be submitted to the blockchain or sent to a thrid-party. It strips away the sensitive information
 * from the CoordinatesInMultiPolygonProof, namely the hash of the user's coordinates. Only the data
 * regarding the polygon(s) in which the user is inside is kept.
 */
export class LocationInPolygon extends SmartContract {
  @state(Field) polygonCommitment = State<Field>();

  @method init() {
    super.init();
    this.polygonCommitment.set(Field(0));
  }

  @method proveLocationInPolygon(
    multiPolygonProof: CoordinatesInMultiPolygonProof
  ) {
    multiPolygonProof.verify();
    //1. Update commitments
  }
}

/**
 * Represents the history of locations. The history of locations is composed of proofs from `LocationInPolygon`.
 * All of the histoircal data and assertions about the lcoation are performed here.
 *
 * This is a "public" proof, meaning it is stored on the blockchain.
 */
export class LocationHistory extends SmartContract {
  @state(Field) merkleRoot = State<Field>();

  @method init() {
    super.init();
    this.merkleRoot.set(Field(0));
  }
}
