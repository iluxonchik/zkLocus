
import { ZKGeoPoint, ZKPublicKey, ZKSignature } from "../../../../api/Models";
import { ZKGeoPointSignatureVerificationCircuitProof } from "../../../../api/proofs/ZKLocusProof";
import { OracleGeoPointProviderCircuit } from "../../../../zkprogram/private/Oracle";
import OracleClient from "../../../utils/OracleClient";
import RandomGeoPointGenerator from "../../../utils/RandomGeoPointGenerator";

const isProofsEnabled: boolean = true;

describe('ZK Locus Oracle Integration Tests', () => {
  const oracleEndpoint = 'http://127.0.0.1:5577'; // Configurable
  const numberOfExecutions = 10; // Configurable
  const oracleClient = new OracleClient(oracleEndpoint);

  beforeAll(async () => {
    if (isProofsEnabled) {
      await OracleGeoPointProviderCircuit.compile();
  }
  });

  describe('Random ZKGeoPoint Verification', () => {
    for (let i = 0; i < numberOfExecutions; i++) {
      it(`should verify the ZKGeoPoint with Oracle signature and public key successfully - Execution ${i + 1}`, async () => {
        const randomGeoPointData = RandomGeoPointGenerator.generateRandomZKGeoPoint();
        const randomGeoPoint = new ZKGeoPoint(randomGeoPointData.latitude, randomGeoPointData.longitude);
        const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(randomGeoPoint.latitude, randomGeoPoint.longitude);

        const zkSignature = new ZKSignature(signature);
        const zkPublicKey = new ZKPublicKey(publicKey);

        // Assuming the existence of a Prove method on ZKGeoPoint or similar object to generate a proof
        const zkGeoPointSource: ZKGeoPointSignatureVerificationCircuitProof = await randomGeoPoint.Prove.authenticateFromIntegrationOracle(zkPublicKey, zkSignature);

        // Verifying the ZKGeoPoint
        zkGeoPointSource.verify();

        // Expectations - asserting the ZKGeoPoint matches
        expect(zkGeoPointSource.zkGeoPoint).toEqual(randomGeoPoint);
      });
    }
  });
});
