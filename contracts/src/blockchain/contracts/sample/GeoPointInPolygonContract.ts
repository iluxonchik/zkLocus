import { SmartContract, State, method, state } from "o1js";
import { GeoPointInPolygonCommitment } from "../../../model/private/Commitment";
import { GeoPointInPolygonCircuitProof, GeoPointInPolygonCombinerCircuitProof} from "../../../zkprogram/private/GeoPointInPolygonCircuit";

export class GeoPointInPolygonContract extends SmartContract {
    @state(GeoPointInPolygonCommitment) geoPointInPolygon = State<GeoPointInPolygonCommitment>();

    @method async submitProof(proof: GeoPointInPolygonCircuitProof) {
        proof.verify();

        this.geoPointInPolygon.set(proof.publicOutput);
    }
}

export class GeoPointInPolygonCombinedContract extends SmartContract {
    @state(GeoPointInPolygonCommitment) geoPointInPolygon = State<GeoPointInPolygonCommitment>();

    @method async submitProof(proof: GeoPointInPolygonCombinerCircuitProof) {
        proof.verify();

        this.geoPointInPolygon.set(proof.publicOutput);
    }
}

export class RandomMina extends SmartContract {
    
}