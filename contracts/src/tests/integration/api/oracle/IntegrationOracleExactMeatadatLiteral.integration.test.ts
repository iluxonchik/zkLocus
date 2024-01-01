
import { ZKSignature } from "../../../../api/models/ZKSignature";
import { ZKPublicKey } from "../../../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../../../api/models/ZKGeoPoint";
import OracleClient from "../../../utils/OracleClient";
import RandomGeoPointGenerator from "../../../utils/RandomGeoPointGenerator";
import { ZKExactGeolocationMetadataCircuitProof } from "../../../../api/proofs/ZKExactGeolocationMetadataCircuitProof";

const isProofsEnabled: boolean = true;


function generateRandomString(minLength: number, maxLength: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}


describe('ZK Locus Oracle Integration Tests For Exact Geolocation', () => {
  const oracleEndpoint = 'http://127.0.0.1:5577'; // Configurable
  const numberOfExecutions = 10; // Configurable
  const oracleClient = new OracleClient(oracleEndpoint);

  beforeAll(async () => {
    if (isProofsEnabled) {
      console.log("Compiling circuits...");
      const startTime = Date.now();
      //await OracleGeoPointProviderCircuit.compile();
      //await ZKGeoPointProviderCircuitProof.compile();
      //await ZKExactGeoPointCircuitProof.compile();
      //await ZKExactGeolocationMetadataCircuitProof.compile();
      await ZKExactGeolocationMetadataCircuitProof.compile();
      const endTime = Date.now();
      console.log("Compilation complete!");
      console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);
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

        // authenticate the ZKGeoPoint using a signature from the Integration Oracle
        await randomGeoPoint.Prove.authenticateFromIntegrationOracle(zkPublicKey, zkSignature);

        const metadata: string = generateRandomString(1, 100000);

        // attach metadata to ZKGeoPoint
        const zkExactGeoPointWithMetadata: ZKExactGeolocationMetadataCircuitProof =  await randomGeoPoint.Prove.attachMetadata(metadata);
        zkExactGeoPointWithMetadata.verify();
        
        // Expectations
        expect(zkExactGeoPointWithMetadata.zkGeoPoint).toEqual(randomGeoPoint);
        expect(zkExactGeoPointWithMetadata.metadata).toEqual(metadata);
      });
    }
  });
});
