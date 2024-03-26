
import { ZKSignature } from "../../../api/models/ZKSignature";
import { ZKPublicKey } from "../../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../../api/models/ZKGeoPoint";
import OracleClient from "../../utils/OracleClient";
import RandomGeoPointGenerator, { RandomGeoPoint, RandomThreePointPolygon } from "../../utils/RandomGeoPointGenerator";
import { ZKThreePointPolygon } from "../../../api/models/ZKThreePointPolygon";
import { OracleGeoPointProviderCircuit, OracleGeoPointProviderCircuitProof } from "../../../zkprogram/private/Oracle";
import { GeoPointProviderCircuit, GeoPointProviderCircuitProof } from "../../../zkprogram/private/Geography";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof, GeoPointInPolygonCombinerCircuit, GeoPointInPolygonCombinerCircuitProof } from "../../../zkprogram/private/GeoPointInPolygonCircuit";
import { ExactGeoPointCircuit } from "../../../zkprogram/public/ExactGeoPointCircuit";
import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from "o1js";
import { GeoPointInPolygonContract } from "../../../blockchain/contracts/sample/GeoPointInPolygonContract";
import { GeoPointInPolygonCommitment } from "../../../model/private/Commitment";

const isProofsEnabled: boolean = true;

const PRIVATE_KEY: string = "EKExputMGvW1TXkURDg6W73AzF3csKGKpKKYzvWujCyYcpS3CkTA";

describe('ZK Locus Oracle Integration Tests For Exact Geolocation', () => {
  const oracleEndpoint = 'http://127.0.0.1:5577'; // Configurable
  const oracleClient = new OracleClient(oracleEndpoint);

  const Local = Mina.LocalBlockchain();
  let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
  let zkAppInstance: GeoPointInPolygonContract;
  const feePayer: PrivateKey = PrivateKey.fromBase58(PRIVATE_KEY);
  const pubKey: PublicKey = feePayer.toPublicKey();

  const pubKeyFields: Field[] = pubKey.toFields();

  console.log(pubKeyFields);
  console.log(pubKeyFields.toString());
  console.log(pubKeyFields.length);


  const privateKeyFields: Field[] = feePayer.toFields();
  console.log(privateKeyFields);
  console.log(privateKeyFields.toString());
  console.log(privateKeyFields.length);


  const feePayerPublicKey: PublicKey = feePayer.toPublicKey();
  const transactionFee = 100_000_000;

  beforeAll(async () => {
    if (isProofsEnabled) {
      console.log("Compiling circuits...");
      const startTime = Date.now();
      await OracleGeoPointProviderCircuit.compile();
      await GeoPointProviderCircuit.compile();
      await ExactGeoPointCircuit.compile();
      await GeoPointInPolygonCircuit.compile();
      await GeoPointInPolygonCombinerCircuit.compile();
      const endTime = Date.now();
      console.log("Compilation complete!");
      console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);

      //Mina.setActiveInstance(Local);
      Mina.setActiveInstance(Berkeley);

      console.log("Compiling smart contract...");
      const startTimeSC = Date.now();
      await GeoPointInPolygonContract.compile();
      const endTimeSC = Date.now();
      console.log("Compilation complete!");
      console.log(`Smart contract compilation took ${endTimeSC - startTimeSC} milliseconds.`);


      const zkAppPrivateKey: PrivateKey = PrivateKey.random();
      const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();
      zkAppInstance = new GeoPointInPolygonContract(zkAppAddress);

      console.log("Deploying smart contract...");
      const txn = await Mina.transaction({sender: feePayerPublicKey, fee: transactionFee}, () => {
        AccountUpdate.fundNewAccount(feePayerPublicKey);
        zkAppInstance.deploy();
      });
      await txn.prove();
      txn.sign([feePayer, zkAppPrivateKey]);
      await txn.send();
      console.log("Smart contract deployed!");

      console.log(txn.toGraphqlQuery());
      console.log();
      console.log(txn.toJSON());
    }
  });

  const randomGenerator: RandomGeoPointGenerator = new RandomGeoPointGenerator();
  const randomGeoPointData = RandomGeoPointGenerator.generateRandomZKGeoPoint();
  const randomGeoPoint = new ZKGeoPoint(randomGeoPointData.latitude, randomGeoPointData.longitude);
  const insideTriangle1: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointInside(randomGeoPointData);
  const insideTriangle2: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointInside(randomGeoPointData);
  const insideTringle3: RandomThreePointPolygon = randomGenerator.generateTriangleWithPointInside(randomGeoPointData);



  describe('Proving a GeoPoint is within a single Three Point Polygon succeeds for a geopoint', () => {
    it('within a single Three Point Polygon', async () => {

      const triangleVertices: RandomGeoPoint[] = insideTriangle1.toRandomGeoPoints();

      const threePointPolygon: ZKThreePointPolygon = new ZKThreePointPolygon(triangleVertices[0], triangleVertices[1], triangleVertices[2]);
      const threePointPolygon2: ZKThreePointPolygon = new ZKThreePointPolygon(insideTriangle2.toRandomGeoPoints()[0], insideTriangle2.toRandomGeoPoints()[1], insideTriangle2.toRandomGeoPoints()[2]);
      const threePointPolygon3: ZKThreePointPolygon = new ZKThreePointPolygon(insideTringle3.toRandomGeoPoints()[0], insideTringle3.toRandomGeoPoints()[1], insideTringle3.toRandomGeoPoints()[2]);

      const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(randomGeoPoint.latitude, randomGeoPoint.longitude);

      const zkSignature = new ZKSignature(signature);
      const zkPublicKey = new ZKPublicKey(publicKey);

      // authenticate the ZKGeoPoint using a signature from the Integration Oracle
      const oracleSignatureVerificationProof: OracleGeoPointProviderCircuitProof = await OracleGeoPointProviderCircuit.fromSignature(
        zkPublicKey.toZKValue(),
        zkSignature.toZKValue(),
        randomGeoPoint.toZKValue()
      );

      const oracleGeoPointProviderProof: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromOracle(
        oracleSignatureVerificationProof,
        randomGeoPoint.toZKValue(),
      );

      console.log("Proving in polygon...")
      const zkGeoPointInPolygonProof1: GeoPointInPolygonCircuitProof = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(oracleGeoPointProviderProof, threePointPolygon.toZKValue());
      await zkGeoPointInPolygonProof1.verify();
      console.log("Point in polygon proved!")

      console.log("Posting proof to blockchain...");
      const txn = await Mina.transaction({sender: feePayerPublicKey, fee: transactionFee}, () => {
        zkAppInstance.submitProof(zkGeoPointInPolygonProof1);
      });
      console.log("\tProving smart contract invocation...");
      await txn.prove();
      console.log("\tSmart contract invocation proved!");
      txn.sign([feePayer]);
      await txn.send();


      const currentState: GeoPointInPolygonCommitment = zkAppInstance.geoPointInPolygon.get();
      expect(currentState).toEqual(zkGeoPointInPolygonProof1.publicOutput);



      console.log("Proving another point in polygon...")
      const zkGeoPointInPolygonProof2: GeoPointInPolygonCircuitProof = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(oracleGeoPointProviderProof, threePointPolygon2.toZKValue());
      zkGeoPointInPolygonProof2.verify();
      console.log("Point in polygon proved!")

      console.log("Combining proofs");
      const combinedProof: GeoPointInPolygonCombinerCircuitProof = await GeoPointInPolygonCombinerCircuit.AND(zkGeoPointInPolygonProof1, zkGeoPointInPolygonProof2);
      combinedProof.verify();
      console.log("Proofs combined");

      console.log("Proving yet another point in polygon...");
      const zkGeoPointInPolygonProof3: GeoPointInPolygonCircuitProof = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(oracleGeoPointProviderProof, threePointPolygon3.toZKValue());
      zkGeoPointInPolygonProof3.verify();
      console.log("Point in polygon proved!");

      console.log("Combining combined proof...");
      const combinedProof2: GeoPointInPolygonCombinerCircuitProof = await GeoPointInPolygonCombinerCircuit.AND(combinedProof, zkGeoPointInPolygonProof3);
      combinedProof2.verify();
      console.log("Combined proofs combined!");

      // Verifying proofs
      zkGeoPointInPolygonProof1.verify();
      zkGeoPointInPolygonProof2.verify();
      combinedProof.verify();

      const combinedPolygonsCommitment: Field = threePointPolygon.combinedHash([threePointPolygon2]);

      // Expectations - asserting the ZKGeoPoint matches
      expect(zkGeoPointInPolygonProof1.publicOutput.isInPolygon.toBoolean()).toBe(true);
      expect(zkGeoPointInPolygonProof2.publicOutput.isInPolygon.toBoolean()).toBe(true);
      expect(combinedProof.publicOutput.isInPolygon.toBoolean()).toBe(true);

      expect(zkGeoPointInPolygonProof1.publicOutput.geoPointCommitment.equals(randomGeoPoint.toZKValue().hash()).toBoolean()).toBe(true);
      expect(zkGeoPointInPolygonProof2.publicOutput.geoPointCommitment.equals(randomGeoPoint.toZKValue().hash()).toBoolean()).toBe(true);
      expect(combinedProof.publicOutput.geoPointCommitment.equals(randomGeoPoint.toZKValue().hash()).toBoolean()).toBe(true);

      expect(zkGeoPointInPolygonProof1.publicOutput.polygonCommitment.equals(threePointPolygon.toZKValue().hash()).toBoolean()).toBe(true);
      expect(zkGeoPointInPolygonProof2.publicOutput.polygonCommitment.equals(threePointPolygon2.toZKValue().hash()).toBoolean()).toBe(true);
      expect(combinedProof.publicOutput.polygonCommitment.equals(combinedPolygonsCommitment).toBoolean()).toBe(true);
    });
  });
});