
import { ZKSignature } from "../../../api/models/ZKSignature";
import { ZKPublicKey } from "../../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../../api/models/ZKGeoPoint";
import OracleClient from "../../utils/OracleClient";
import RandomGeoPointGenerator from "../../utils/RandomGeoPointGenerator";
import { OracleGeoPointProviderCircuit, OracleGeoPointProviderCircuitProof } from "../../../zkprogram/private/Oracle";
import { GeoPointProviderCircuit, GeoPointProviderCircuitProof } from "../../../zkprogram/private/Geography";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCircuitProof, GeoPointInPolygonCombinerCircuit, GeoPointInPolygonCombinerCircuitProof } from "../../../zkprogram/private/GeoPointInPolygonCircuit";
import { ExactGeoPointCircuit } from "../../../zkprogram/public/ExactGeoPointCircuit";
import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from "o1js";
import { ExactGeolocationMetadataCircuit } from "../../../zkprogram/public/Metadata";
import { GeoPointWithMetadataContract } from "../../../blockchain/contracts/sample/ExactGeoPointWithMetadataContract";
import { MetadataGeoPointCommitment } from "../../../model/public/Commitment";

const isProofsEnabled: boolean = true;

const PRIVATE_KEY: string = "EKExputMGvW1TXkURDg6W73AzF3csKGKpKKYzvWujCyYcpS3CkTA";

describe('ZK Locus Oracle Integration Tests For Exact Geolocation', () => {
  const oracleEndpoint = 'http://127.0.0.1:5577'; // Configurable
  const oracleClient = new OracleClient(oracleEndpoint);

  const Local = Mina.LocalBlockchain();
  let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
  let zkAppInstance: GeoPointWithMetadataContract;
  const feePayer: PrivateKey = PrivateKey.fromBase58(PRIVATE_KEY)
  const feePayerPublicKey: PublicKey = feePayer.toPublicKey();
  const transactionFee = 100_000_000;

  beforeAll(async () => {
    if (isProofsEnabled) {
      console.log("Compiling circuits...");
      const startTime = Date.now();
      await OracleGeoPointProviderCircuit.compile();
      await GeoPointProviderCircuit.compile();
      await ExactGeoPointCircuit.compile();
      await ExactGeolocationMetadataCircuit.compile();
      const endTime = Date.now();
      console.log("Compilation complete!");
      console.log(`Proofs compilation took ${endTime - startTime} milliseconds.`);

      //Mina.setActiveInstance(Local);
      Mina.setActiveInstance(Berkeley);

      console.log("Compiling smart contract...");
      const startTimeSC = Date.now();
      await GeoPointWithMetadataContract.compile();
      const endTimeSC = Date.now();
      console.log("Compilation complete!");
      console.log(`Smart contract compilation took ${endTimeSC - startTimeSC} milliseconds.`);


      const zkAppPrivateKey: PrivateKey = PrivateKey.random();
      const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();
      zkAppInstance = new GeoPointWithMetadataContract(zkAppAddress);

      console.log("Deploying smart contract...");
      const txn = await Mina.transaction({sender: feePayerPublicKey, fee: transactionFee}, async () => {
        AccountUpdate.fundNewAccount(feePayerPublicKey);
        await zkAppInstance.deploy();
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

  const randomGeoPointData = RandomGeoPointGenerator.generateRandomZKGeoPoint();
  const randomGeoPoint: ZKGeoPoint  = new ZKGeoPoint(randomGeoPointData.latitude, randomGeoPointData.longitude);
  



  describe('Proving a GeoPoint is within a single Three Point Polygon succeeds for a geopoint', () => {
    it('within a single Three Point Polygon', async () => {


      const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(randomGeoPoint.latitude, randomGeoPoint.longitude);

      const zkSignature = new ZKSignature(signature);
      const zkPublicKey = new ZKPublicKey(publicKey);

      // authenticate the ZKGeoPoint using a signature from the Integration Oracle
      
      console.log("Authenticating geolocation proof...")
      await randomGeoPoint.Prove.authenticateFromIntegrationOracle(zkPublicKey, zkSignature)
      console.log("Geolocation proof authenticated!");

      console.log("Attaching metadata to geolocation proof...")
        const zkProof = await randomGeoPoint.Prove.attachMetadata("Hello, my name is Illya Gerasymchuk");
      console.log("Metadata attached to geolocation proof!")

      console.log("Posting proof to blockchain...");
      const txn = await Mina.transaction({sender: feePayerPublicKey, fee: transactionFee}, async () => {
        await zkAppInstance.submitProof(zkProof.proof);
      });
      console.log("\tProving smart contract invocation...");
      await txn.prove();
      console.log("\tSmart contract invocation proved!");
      txn.sign([feePayer]);
      await txn.send();


      const currentState: MetadataGeoPointCommitment = zkAppInstance.geoPointWithMetadata.get();
      expect(currentState).toEqual(zkProof.proof.publicOutput);
    });
  });
});