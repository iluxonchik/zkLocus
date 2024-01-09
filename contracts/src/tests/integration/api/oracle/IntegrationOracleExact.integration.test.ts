
import { ZKSignature } from "../../../../api/models/ZKSignature";
import { ZKPublicKey } from "../../../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../../../api/models/ZKGeoPoint";
import { ZKExactGeoPointCircuitProof } from "../../../../api/proofs/ZKExactGeoPointCircuitProof";
import OracleClient from "../../../utils/OracleClient";
import RandomGeoPointGenerator from "../../../utils/RandomGeoPointGenerator";

const isProofsEnabled: boolean = true;

describe('ZK Locus Oracle Integration Tests For Exact Geolocation', () => {
  const oracleEndpoint = 'http://127.0.0.1:5577'; // Configurable
  const numberOfExecutions = 10; // Configurable
  const oracleClient = new OracleClient(oracleEndpoint);

  beforeAll(async () => {
    if (isProofsEnabled) {
      console.log("Compiling circuits...");
      const startTime = Date.now();
      await ZKExactGeoPointCircuitProof.compile();
      const endTime = Date.now();
      console.log("Compilation complete!");
      console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);
  }
  });

  describe('Random ZKGeoPoint Verification', () => {
    for (let i = 0; i < numberOfExecutions; i++) {
      it(`should verify the ZKGeoPoint with Oracle signature and public key successfully - Execution ${i + 1}`, async () => {
        const randomGeoPointData = RandomGeoPointGenerator.generateRandomZKGeoPoint();
        console.log('randomGeoPointData', randomGeoPointData);
        const randomGeoPoint = new ZKGeoPoint(randomGeoPointData.latitude, randomGeoPointData.longitude);

        console.log('randomLatitude', randomGeoPoint.latitude);
        console.log('randomLongitude', randomGeoPoint.longitude);

        console.log('ZKGeoPoint.latitude', randomGeoPoint.latitude);
        console.log('ZKGeoPoint.longitude', randomGeoPoint.longitude);


        const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(randomGeoPoint.latitude, randomGeoPoint.longitude);

        const zkSignature = new ZKSignature(signature);
        const zkPublicKey = new ZKPublicKey(publicKey);

        // authenticate the ZKGeoPoint using a signature from the Integration Oracle
        await randomGeoPoint.Prove.authenticateFromIntegrationOracle(zkPublicKey, zkSignature);

        const zkExactGeoPointSource: ZKExactGeoPointCircuitProof = await randomGeoPoint.Prove.exactGeoPoint();

        // Verifying the ZKGeoPoint
        zkExactGeoPointSource.verify();

        // Expectations - asserting the ZKGeoPoint matches
        expect(zkExactGeoPointSource.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
      });
    }
  });
});
