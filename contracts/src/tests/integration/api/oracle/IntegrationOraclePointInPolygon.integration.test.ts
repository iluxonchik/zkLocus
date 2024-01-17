
import { ZKSignature } from "../../../../api/models/ZKSignature";
import { ZKPublicKey } from "../../../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../../../api/models/ZKGeoPoint";
import { ZKExactGeoPointCircuitProof } from "../../../../api/proofs/ZKExactGeoPointCircuitProof";
import OracleClient from "../../../utils/OracleClient";
import RandomGeoPointGenerator, { RandomGeoPoint, RandomThreePointPolygon } from "../../../utils/RandomGeoPointGenerator";
import { GeoPointInPolygonCombinationOperator, ZKGeoPointInPolygonProof } from "../../../../api/proofs/ZKGeoPointInPolygonProof";
import { ZKThreePointPolygon } from "../../../../api/models/ZKThreePointPolygon";
import { ZKGeoPointInOrOutOfPolygonCircuitProof } from "../../../../api/proofs/ZKGeoPointInOrOutOfPolygonCircuitProof";
import { Field } from "o1js";

const isProofsEnabled: boolean = true;

function fail(reason: any) {
  throw new Error(reason.toString());
}


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

  describe('Proving a GeoPoint is within Three Point Polygon', () => {
    const randomGenerator: RandomGeoPointGenerator = new RandomGeoPointGenerator();
    const randomGeoPointData = RandomGeoPointGenerator.generateRandomZKGeoPoint();
    const randomGeoPoint = new ZKGeoPoint(randomGeoPointData.latitude, randomGeoPointData.longitude);
    const insideTriangle1: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointInside(randomGeoPointData);
    const insideTriangle2: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointInside(randomGeoPointData);
    const insideTriangle3: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointInside(randomGeoPointData);

    const outsideTriangle1: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointOutside(randomGeoPointData);
    const outsideTriangle2: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointOutside(randomGeoPointData);

    const insideTriangleVertices1: RandomGeoPoint[] = insideTriangle1.toRandomGeoPoints();
    const insideTriangleVertices2: RandomGeoPoint[] = insideTriangle2.toRandomGeoPoints();
    const insideTriangleVertices3: RandomGeoPoint[] = insideTriangle3.toRandomGeoPoints();

    const outsideTriangleVertices1: RandomGeoPoint[] = outsideTriangle1.toRandomGeoPoints();
    const outsideTriangleVertices2: RandomGeoPoint[] = outsideTriangle2.toRandomGeoPoints();

    const insideThreePointPolygon1: ZKThreePointPolygon = new ZKThreePointPolygon(insideTriangleVertices1[0], insideTriangleVertices1[1], insideTriangleVertices1[2]);
    const insideThreePointPolygon2: ZKThreePointPolygon = new ZKThreePointPolygon(insideTriangleVertices2[0], insideTriangleVertices2[1], insideTriangleVertices2[2]);
    const isndieThreePointPolygon3: ZKThreePointPolygon = new ZKThreePointPolygon(insideTriangleVertices3[0], insideTriangleVertices3[1], insideTriangleVertices3[2]);

    const outsideThreePointPolygon1: ZKThreePointPolygon = new ZKThreePointPolygon(outsideTriangleVertices1[0], outsideTriangleVertices1[1], outsideTriangleVertices1[2]);
    const outsideThreePointPolygon2: ZKThreePointPolygon = new ZKThreePointPolygon(outsideTriangleVertices2[0], outsideTriangleVertices2[1], outsideTriangleVertices2[2]);

    if (outsideThreePointPolygon1.isEquals(outsideThreePointPolygon2)) {
      throw new Error('Test aborted: Outside triangles are the same');
    }

    console.log('GeoPoint: ', randomGeoPointData);
    console.log('Inside Polygon 1: ', insideThreePointPolygon1.toString());
    console.log('Inside Polygon 2: ', insideThreePointPolygon2.toString());
    console.log('Inside Polygon 3: ', isndieThreePointPolygon3.toString());

    console.log('Outside Polygon 1: ', outsideThreePointPolygon1.toString());
    console.log('Outside Polygon 2: ', outsideThreePointPolygon2.toString());

    let zkGeoPointInPolygonProofInside1: ZKGeoPointInPolygonProof;
    let zkGeoPointInPolygonProofIndside2: ZKGeoPointInPolygonProof;
    let zkGeoPointInPolygonProofInside3: ZKGeoPointInPolygonProof;

    let combinedZKGeoPointInPolygonProofInside1: ZKGeoPointInPolygonProof;
    let combinedZKGeoPointInPolygonProofInside2: ZKGeoPointInPolygonProof;

    let zkGeoPointInPolygonProofOutside1: ZKGeoPointInPolygonProof;
    let zkGeoPointInPolygonProofOutside2: ZKGeoPointInPolygonProof;
    let combinedZKGeoPointInPolygonProofOutside1: ZKGeoPointInPolygonProof;

    let insdieOutsdieProof1: ZKGeoPointInOrOutOfPolygonCircuitProof;

    it('succeeds for a singe polygon', async () => {
      const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(randomGeoPoint.latitude, randomGeoPoint.longitude);

      const zkSignature = new ZKSignature(signature);
      const zkPublicKey = new ZKPublicKey(publicKey);

      // authenticate the ZKGeoPoint using a signature from the Integration Oracle
      await randomGeoPoint.Prove.authenticateFromIntegrationOracle(zkPublicKey, zkSignature);

      zkGeoPointInPolygonProofInside1 = await randomGeoPoint.Prove.inPolygon(insideThreePointPolygon1);

      // Verifying the ZKGeoPoint
      zkGeoPointInPolygonProofInside1.verify();

      // Expectations - asserting the ZKGeoPoint matches
      expect(zkGeoPointInPolygonProofInside1.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
      expect(zkGeoPointInPolygonProofInside1.isGeoPointInsidePolygon).toBe(true);

      expect(zkGeoPointInPolygonProofInside1.zkPolygon).toBeDefined();
      expect(zkGeoPointInPolygonProofInside1.leftZKProof).toBeUndefined();
      expect(zkGeoPointInPolygonProofInside1.rightZKProof).toBeUndefined();

      expect(zkGeoPointInPolygonProofInside1.zkPolygon!.isEquals(insideThreePointPolygon1)).toBe(true);

    });

    it('succeeds combined with two inside ANDed Three Point Polygons', async () => {

      // ensure that both triangles are not the same
      if (insideTriangle1.isEquals(insideTriangle2)) {
        throw new Error('Test aborted: Triangles are the same');
      }

      try {
        zkGeoPointInPolygonProofIndside2 = await randomGeoPoint.Prove.inPolygon(insideThreePointPolygon2);
      } catch(e: any) {
        console.log('Error: ', e);
        fail(e);
      }
      
      try {
        combinedZKGeoPointInPolygonProofInside1 = await zkGeoPointInPolygonProofInside1.AND(zkGeoPointInPolygonProofIndside2);
      } catch(e: any) {
        console.log('Error: ', e);
        fail(e);
      }


      // Expected results
      expect(zkGeoPointInPolygonProofIndside2.isGeoPointInsidePolygon).toBe(true);
      expect(zkGeoPointInPolygonProofIndside2.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);

      expect(combinedZKGeoPointInPolygonProofInside1.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofInside1.isGeoPointInsidePolygon).toBe(true);

      expect(combinedZKGeoPointInPolygonProofInside1.zkPolygon).toBe(undefined);
      expect(combinedZKGeoPointInPolygonProofInside1.leftZKProof).toBeDefined();
      expect(combinedZKGeoPointInPolygonProofInside1.rightZKProof).toBeDefined();

      expect(combinedZKGeoPointInPolygonProofInside1.leftZKProof!.isEquals(zkGeoPointInPolygonProofInside1)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofInside1.rightZKProof!.isEquals(zkGeoPointInPolygonProofIndside2)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofInside1.operator).toBe(GeoPointInPolygonCombinationOperator.AND)

      await expect(randomGeoPoint.Prove.combinePointInPolygonProofs()).rejects.toThrow();
    });

    it('succeeds within three combined inside ANDed Three Point Polygons', async () => {
      if (insideTriangle1.isEquals(insideTriangle3) || insideTriangle2.isEquals(insideTriangle3)) {
        throw new Error('Test aborted: Triangles are the same');
      }

      try {

        zkGeoPointInPolygonProofInside3 = await randomGeoPoint.Prove.inPolygon(isndieThreePointPolygon3);
      } catch(e: any) {
        console.log('Error: ', e);
        fail(e);
      }

      try {
        combinedZKGeoPointInPolygonProofInside2 = await combinedZKGeoPointInPolygonProofInside1.AND(zkGeoPointInPolygonProofInside3); 
      } catch(e: any) {
        console.log('Error: ', e);
        fail(e);
      }
     combinedZKGeoPointInPolygonProofInside2.verify();

      // Expectations
      expect(combinedZKGeoPointInPolygonProofInside2.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofInside2.isGeoPointInsidePolygon).toBe(true);

      expect(combinedZKGeoPointInPolygonProofInside2.zkPolygon).toBeUndefined();
      expect(combinedZKGeoPointInPolygonProofInside2.leftZKProof).toBeDefined();
      expect(combinedZKGeoPointInPolygonProofInside2.rightZKProof).toBeDefined();

      expect(combinedZKGeoPointInPolygonProofInside2.leftZKProof!.isEquals(combinedZKGeoPointInPolygonProofInside1)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofInside2.rightZKProof!.isEquals(zkGeoPointInPolygonProofInside3)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofInside1.operator).toBe(GeoPointInPolygonCombinationOperator.AND)

      await expect(randomGeoPoint.Prove.combinePointInPolygonProofs()).rejects.toThrow();

    });

    it('succeeds with one Three Point Polygon outside', async () => {
      try{
        zkGeoPointInPolygonProofOutside1 = await randomGeoPoint.Prove.inPolygon(outsideThreePointPolygon1);
      } catch(e: any) {
        console.log('Error: ', e);
        fail(e);
      }

        zkGeoPointInPolygonProofOutside1.verify();

        // Expectations
        expect(zkGeoPointInPolygonProofOutside1.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
        expect(zkGeoPointInPolygonProofOutside1.isGeoPointInsidePolygon).toBe(false);

        expect(zkGeoPointInPolygonProofOutside1.zkPolygon).toBeDefined();
        expect(zkGeoPointInPolygonProofOutside1.leftZKProof).toBeUndefined();
        expect(zkGeoPointInPolygonProofOutside1.rightZKProof).toBeUndefined();

        expect(zkGeoPointInPolygonProofOutside1.zkPolygon!.isEquals(outsideThreePointPolygon1)).toBe(true); 
    });

    it('succeeds with two Three Point Polygons outside', async () => {
      try {

      zkGeoPointInPolygonProofOutside2 = await randomGeoPoint.Prove.inPolygon(outsideThreePointPolygon2);
      } catch(e) {
        console.log('Error: ', e);
        fail(e);
      }
      try {
      combinedZKGeoPointInPolygonProofOutside1 = await zkGeoPointInPolygonProofOutside1.AND(zkGeoPointInPolygonProofOutside2);
 
      } catch(e) {
        console.log('Error: ', e);
        fail(e);
      }
     combinedZKGeoPointInPolygonProofOutside1.verify();

      // Expectations
      expect(zkGeoPointInPolygonProofOutside2.isGeoPointInsidePolygon).toBe(false);
      expect(zkGeoPointInPolygonProofOutside2.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);

      expect(combinedZKGeoPointInPolygonProofOutside1.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofOutside1.isGeoPointInsidePolygon).toBe(false);

      expect(combinedZKGeoPointInPolygonProofOutside1.zkPolygon).toBeUndefined();
      expect(combinedZKGeoPointInPolygonProofOutside1.leftZKProof).toBeDefined();
      expect(combinedZKGeoPointInPolygonProofOutside1.rightZKProof).toBeDefined();

      expect(combinedZKGeoPointInPolygonProofOutside1.leftZKProof!.isEquals(zkGeoPointInPolygonProofOutside1)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofOutside1.rightZKProof!.isEquals(zkGeoPointInPolygonProofOutside2)).toBe(true);
      expect(combinedZKGeoPointInPolygonProofOutside1.operator).toBe(GeoPointInPolygonCombinationOperator.AND);
    });

    it('succeeds with generating a combined inside/outside proof', async () => {
      try {
        insdieOutsdieProof1 = await randomGeoPoint.Prove.combinePointInPolygonProofs();
      } catch(e: any) {
        console.log('Error: ', e);
        fail(e);
      }


      const allZkGeoPointInPolygonProofs: ZKGeoPointInPolygonProof[] = [zkGeoPointInPolygonProofInside1, zkGeoPointInPolygonProofIndside2, zkGeoPointInPolygonProofInside3];
      const allZkGeoPointInPolygonProofsOutside: ZKGeoPointInPolygonProof[] = [zkGeoPointInPolygonProofOutside1, zkGeoPointInPolygonProofOutside2];

      const combinedInsideHash: Field = ZKThreePointPolygon.combinedHash([insideThreePointPolygon1, insideThreePointPolygon2, isndieThreePointPolygon3]);
      const combinedOutsideHash: Field = ZKThreePointPolygon.combinedHash([outsideThreePointPolygon1, outsideThreePointPolygon2]);

      // Expectations
      expect(insdieOutsdieProof1.zkGeoPoint.isEquals(randomGeoPoint)).toBe(true);
      expect(insdieOutsdieProof1.commitment.insidePolygonCommitment.equals(combinedInsideHash)).toBe(true);
      expect(insdieOutsdieProof1.commitment.outsidePolygonCommitment.equals(combinedOutsideHash)).toBe(true);
      expect(insdieOutsdieProof1.commitment.coordinatesCommitment.equals(randomGeoPoint.hash())).toBe(true);


      for (let i = 0; i < insdieOutsdieProof1.insideProofs.individualZkProofs.length; i++) {
        expect(insdieOutsdieProof1.insideProofs.individualZkProofs[i].isEquals(allZkGeoPointInPolygonProofs[i])).toBe(true);
      }

      for (let i = 0; i < insdieOutsdieProof1.outsideProofs.individualZkProofs.length; i++) {
        expect(insdieOutsdieProof1.outsideProofs.individualZkProofs[i].isEquals(allZkGeoPointInPolygonProofsOutside[i])).toBe(true);
      }
    });
  });
});