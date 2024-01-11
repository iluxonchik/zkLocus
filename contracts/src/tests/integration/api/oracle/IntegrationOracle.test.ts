import { ZKSignature } from "../../../../api/models/ZKSignature";
import { ZKPublicKey } from "../../../../api/models/ZKPublicKey";
import { ZKGeoPoint } from "../../../../api/models/ZKGeoPoint";
import { ZKGeoPointProviderCircuitProof } from "../../../../api/proofs/ZKGeoPointProviderCircuitProof";

const isProofsEnabled: boolean = true;

class OracleSignature {
    constructor(public readonly zkPublicKey: ZKPublicKey, public readonly zkSignature: ZKSignature, public readonly zkGeoPoint: ZKGeoPoint) { }
}


describe('Integration Oracle', () => {

    beforeAll(async () => {

        if (isProofsEnabled) {
            await ZKGeoPointProviderCircuitProof.compile();
        }
    });


    describe('Valid Signature', () => {
        const oraclePublicKey: ZKPublicKey = new ZKPublicKey("B62qpo8S8Jzd3P6UyuuJwVB5SUF4r8TYhHqCBC5bFZV4pSonBNcW3DB");
        let validZKGeoPoint: ZKGeoPoint = new ZKGeoPoint(89.123, -123.123)
        let validOracleGeoPoint: OracleSignature = new OracleSignature(
            oraclePublicKey,
            new ZKSignature("7mX9SFseeigBzjNjzH4e4gnPe9HAoXQD85nKiwd9piobx71ZpDYYZ6WJtZXjaATb6kSXf8FEHFKgv6CiQ8SHUgNiaEL26FtP"),
            new ZKGeoPoint(89.123, -123.123)
        );
    
        describe('when valid GeoPoint signature is provided to ZK Circuit', () => {
            it('computes the authenticated geolocation commitment correclty', async () => {
                const zkGeoPointSource: ZKGeoPointProviderCircuitProof = await validZKGeoPoint.Prove.authenticateFromIntegrationOracle(validOracleGeoPoint.zkPublicKey, validOracleGeoPoint.zkSignature);
                zkGeoPointSource.verify();
                expect(zkGeoPointSource.zkGeoPoint.isEquals(validZKGeoPoint)).toBe(true);
            });
            });
        });
    });






