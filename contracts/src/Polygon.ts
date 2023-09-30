import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Struct,
  Poseidon,
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

export class PolygonProof extends SmartContract {
  @state(Field) polygonCommitment = State<Field>();
  @state(Field) pointCommitment = State<Field>();
  @state(Field) sourceCommitment = State<Field>();

  init() {
    super.init();
    this.polygonCommitment.set(Field(0));

    this.pointCommitment.set(Field(0));

    this.sourceCommitment.set(Field(0));
  }
}

export class SimplePolygonProof extends PolygonProof {
  @method provePointInPolygon(
    point: GeographicalPoint,
    polygon: SimplePolygon
  ) {
    // verify if the point is in the polygon
    const hashOfGeoPoint = point.hash();
    const hashOfPolygon = polygon.hash();

    this.pointCommitment.set(hashOfGeoPoint);
    this.polygonCommitment.set(hashOfPolygon);
  }
}
