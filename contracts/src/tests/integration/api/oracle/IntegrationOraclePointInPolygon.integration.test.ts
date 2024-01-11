
import { ZKSignature } from "../../../../api/models/ZKSignature";
import { ZKPublicKey } from "../../../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../../../api/models/ZKGeoPoint";
import { ZKExactGeoPointCircuitProof } from "../../../../api/proofs/ZKExactGeoPointCircuitProof";
import OracleClient from "../../../utils/OracleClient";
import RandomGeoPointGenerator, { RandomGeoPoint } from "../../../utils/RandomGeoPointGenerator";
import { ZKGeoPointInPolygonProof } from "../../../../api/proofs/ZKGeoPointInPolygonProof";
import { ZKThreePointPolygon } from "../../../../api/models/ZKThreePointPolygon";

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
      await ZKGeoPointInPolygonProof.compile();
      const endTime = Date.now();
      console.log("Compilation complete!");
      console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);
  }
  });

  describe('Proving a GeoPoint is within a single Three Point Polygon', () => {
    it('Succeeds for a point within a Three Point Polygon', async () => {
      const randomGenerator: RandomGeoPointGenerator = new RandomGeoPointGenerator();
      const randomGeoPointData = RandomGeoPointGenerator.generateRandomZKGeoPoint();
      console.log('randomGeoPointData', randomGeoPointData);
      const randomGeoPoint = new ZKGeoPoint(randomGeoPointData.latitude, randomGeoPointData.longitude);
      const insideTriangle: RandomGeoPoint[] = randomGenerator.generateTriangleWithPointInside(randomGeoPointData);

      const threePointPolygon: ZKThreePointPolygon = new ZKThreePointPolygon(insideTriangle[0], insideTriangle[1], insideTriangle[2]);

      console.log('randomLatitude', randomGeoPoint.latitude);
      console.log('randomLongitude', randomGeoPoint.longitude);

      console.log('ZKGeoPoint.latitude', randomGeoPoint.latitude);
      console.log('ZKGeoPoint.longitude', randomGeoPoint.longitude);


      const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(randomGeoPoint.latitude, randomGeoPoint.longitude);

      const zkSignature = new ZKSignature(signature);
      const zkPublicKey = new ZKPublicKey(publicKey);

      // authenticate the ZKGeoPoint using a signature from the Integration Oracle
      await randomGeoPoint.Prove.authenticateFromIntegrationOracle(zkPublicKey, zkSignature);

      const zkGeoPointInPolygonProof: ZKGeoPointInPolygonProof = await randomGeoPoint.Prove.inPolygon(threePointPolygon);

      // Verifying the ZKGeoPoint
      zkGeoPointInPolygonProof.verify();

      // Expectations - asserting the ZKGeoPoint matches
      expect(zkGeoPointInPolygonProof.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
      expect(zkGeoPointInPolygonProof.isGeoPointInsidePolygon).toBe(true);
    });
  });

});