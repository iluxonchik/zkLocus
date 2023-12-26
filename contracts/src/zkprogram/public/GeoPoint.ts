import { ZkProgram } from "o1js";
import { GeoPointCommitment } from "../../model/public/Commitment";
import { GeoPointProviderCircuitProof } from "../private/Geography";
import { proveExactGeoPointFromProvider } from "../../logic/public/ExactGeoPoint";

/*
* Set of Zero-Knowledge Circuits for generating an exact GeoPoint proof.
* 
* Visibility: Public
*/
export const ExactGeoPointCircuit = ZkProgram({
    name: "ExactGeoPointCircuit", 
    publicOutput: GeoPointCommitment,
    methods: {
        fromGeoPointProvider: {
            privateInputs: [GeoPointProviderCircuitProof],
            method: proveExactGeoPointFromProvider,
        }
    }

});

export class ExactGeoPointCircuitProof extends ZkProgram.Proof(ExactGeoPointCircuit) {}