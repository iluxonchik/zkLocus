import { Bool, Empty, Int64, Proof } from "o1js";
import { ZKSignature } from "../../api/models/ZKSignature";
import { ZKPublicKey } from "../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../api/models/ZKGeoPoint";
import { OracleGeoPointProviderCircuit } from "../../zkprogram/private/Oracle";
import { ZKGeoPointSignatureVerificationCircuitProof } from "../../api/proofs/ZKLocusProof";
import { ZKGeoPointProviderCircuitProof } from "../../api/proofs/ZKGeoPointProviderCircuitProof";

const isProofsEnabled: boolean = true;

class OracleSignature {
    constructor(public readonly zkPublicKey: ZKPublicKey, public readonly zkSignature: ZKSignature, public readonly zkGeoPoint: ZKGeoPoint) { }
}


describe('Integration Oracle', () => {

    beforeAll(async () => {

        if (isProofsEnabled) {
            await OracleGeoPointProviderCircuit.compile();
        }
    });


    describe('Valid Signature', () => {
        const oraclePublicKey: ZKPublicKey = new ZKPublicKey("B62qqrvqndzyrgVmaH3LDSVEXLqcWDuNjgSKgyrYhkJfYAZAXpyecmc");
        let validZKGeoPoint: ZKGeoPoint = new ZKGeoPoint(45.67567, 25.55484)
        let validOracleGeoPoint: OracleSignature = new OracleSignature(
            oraclePublicKey,
            new ZKSignature("7mXTCs7YEETZHciBBGELEiuVVSWsyMDramsWA6e5pHAmRUE48JgmHY7tjYtMqCBX1Gw4FpMGq7THx1WQbSxhcjQMhaBiL4jC"),
            new ZKGeoPoint(45.67567, 25.55484)
        );
    
        describe('when valid GeoPoint signature is provided to ZK Circuit', () => {
            it('computes the authenticated geolocation commitment correclty', async () => {
                const zkGeoPointSource: ZKGeoPointProviderCircuitProof = await validZKGeoPoint.Prove.authenticateFromIntegrationOracle(validOracleGeoPoint.zkPublicKey, validOracleGeoPoint.zkSignature);
                zkGeoPointSource.verify();
                expect(zkGeoPointSource.zkGeoPoint).toEqual(validZKGeoPoint);
            });
            });
        });
    });






