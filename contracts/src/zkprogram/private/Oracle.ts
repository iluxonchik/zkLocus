import { PublicKey, Signature, ZkProgram} from "o1js";
import { GeoPoint } from "../../model/Geography";
import { OracleAuthenticatedGeoPointCommitment } from "../../model/private/Oracle";
import { extractGeoPointFromSignature } from "../../logic/methods/Oracle";

/**
 * An implementation of an authenticted GeoPoint source that uses an Oracle. The Oracle can run arbitrary code,
 * it can be implemented in any programming language, and run in an arbitrary environment, such as the public
 * blockchain like Mina and Ethereum, or a REST HTTP endpoint.
 * 
 * This circuit recieves an authenticated GeoPoint (latitude, longitude geographic coordinates) from *any* Oracle,
 * verifies that response, and returns a commitment to the GeoPoint provided by the Oracle. The authenticating Oracle
 * is cryptographically included in the output GeoPoint commitment, since the GeoPoint is hashed together with the
 * digest of the public key.
 * 
 * The Circuit works with any Oracle, by parameterizing the public key as a private intput. This means that it can be
 * used with any public key. As such, there is no need to write custom circuits for each Oracle, as this one can be
 * reused by them all. You focus on writing the Oracle in the programming language of your choice, execute it in the
 * environemnt of your choice, and zkLocus will naturally integrate with YOUR solution. Moreover, using custom
 * Oralces does not complicate the end-user API usage in any manner.
 */
export const OracleGeoPointProviderCircuit = ZkProgram({
  name: "GeoPointSignatureVerificationCircuit",
  publicOutput: OracleAuthenticatedGeoPointCommitment,

  methods: {
    fromSignature: {
      privateInputs: [PublicKey, Signature, GeoPoint],
      method:  extractGeoPointFromSignature,  
    }
  }
});

export class GeoPointSignatureVerificationCircuitProof extends ZkProgram.Proof(OracleGeoPointProviderCircuit) {}
