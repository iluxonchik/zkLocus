import { ZkProgram } from "o1js";
import { MetadataGeoPointCommitment } from "../../model/public/Commitment";
import { GeoPointProviderCircuitProof } from "../private/Geography";
import { attachMetadataToGeoPoint} from "../../logic/public/ExactGeoPoint";
import { SHA3_512 } from "../../model/public/SHA3";

// TODO | IMPORTANT //
// Add a method to ExactGeolocationMetadataCircuit that takes two recursive proofs as inputs:
// 1. GeoPointProviderCircuitProof
// 2. A proof that returns SHA3_512.provable as its public output. This way, it's possible to attached authenticated metadata.
//    This is much better than passing metadata as magic value, since the circuit that produces the metadata itself can
//    perform verifiable association of the metadata to the GeoPoint in question. For example, the circuit that produced the proof, can
//    commit the metadata to a particular GeoPoint, and verify that that metadata is indeed associated to that GeoPont.

/*
* Set of Zero-Knowledge Circuits for associating arbitrary metadata to an exact GeoPoint proof.
*
* Visibility: Public
*/
export const ExactGeolocationMetadataCircuit = ZkProgram({
    name: "ExactGeoPointMetadataCircuit",
    publicOutput: MetadataGeoPointCommitment,
    methods: {
        attachMetadataToGeoPoint: {
            privateInputs: [GeoPointProviderCircuitProof, SHA3_512.provable],
            method: attachMetadataToGeoPoint,
        }
    }
});

export class ExactGeolocationMetadataCircuitProof extends ZkProgram.Proof(ExactGeolocationMetadataCircuit) { }
