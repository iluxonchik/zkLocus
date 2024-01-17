import { Bool, Empty, Int64, Proof } from "o1js";
import { GeoPointProviderCircuit, GeoPointProviderCircuitProof } from '../zkprogram/private/Geography';
import { GeoPointInPolygonCommitment } from '../model/private/Commitment';
import { GeoPoint, ThreePointPolygon } from '../model/Geography';
import { ZKGeoPointInPolygonProof } from "../api/proofs/ZKGeoPointInPolygonProof";
import { ZKGeoPointProviderCircuitProof } from "../api/proofs/ZKGeoPointProviderCircuitProof";
import { GeoPointInPolygonCircuit, GeoPointInPolygonCombinerCircuit } from "../zkprogram/private/GeoPointInPolygonCircuit";

class InternalStructuresInterface {

    static countDecimals(value: number): number {
        if (!isFinite(value)) return 0; // Handle Infinity and NaN

        let text = value.toString();
        // Check if the number is in exponential form
        if (text.indexOf('e-') > -1) {
            const parts = text.split('e-');
            const e = parseInt(parts[1], 10);
            return e; // The number of decimal places is equal to the exponent in this case
        }
        // Normal decimal number
        if (text.indexOf('.') > -1) {
            return text.split('.')[1].length;
        }

        return 0; // No decimal point means 0 decimal places
    }

    static geographicalPointFromNumber(latitude: number, longitude: number): GeoPoint {
        const num_digits_after_decimal_in_logitude: number = InternalStructuresInterface.countDecimals(longitude);
        const num_digits_after_decimal_in_latitude: number = InternalStructuresInterface.countDecimals(latitude);

        const larger_value: number = Math.max(num_digits_after_decimal_in_latitude, num_digits_after_decimal_in_logitude);

        if (larger_value > 8) {
            throw new Error('Number of digits after decimal in longitude and latitude must be less than 8');
        }

        const normalizedLatitude: number = latitude * (10 ** larger_value);
        const normalizedLongitude: number = longitude * (10 ** larger_value);
        const factor: number = 10 ** larger_value;

        const point: GeoPoint = new GeoPoint({
            latitude: Int64.from(normalizedLatitude),
            longitude: Int64.from(normalizedLongitude),
            factor: Int64.from(factor),
        });
        return point;
    }
}

const isProofsEnabled: boolean = true;
describe('CoordinatesInPolygon', () => {

    let brasovCenterPolygon: ThreePointPolygon;
    let brasovCenterCoordinates: GeoPoint;
    let notBrasovCenterCoordinates: GeoPoint;
    let notInRomaniaCoordinates: GeoPoint;

    let proofBrasovCenterCoordinatesInBrasovCenterPolygon: Proof<undefined, GeoPointInPolygonCommitment>;
    let proofNotBrasovCenterCoordinatesInBrasovCenterPolygon: Proof<undefined, GeoPointInPolygonCommitment>;
    let proofNotInRomaniaCoordinatesNotInBrasovCenterPolygon: Proof<undefined, GeoPointInPolygonCommitment>;


    beforeAll(async () => {

        if (isProofsEnabled) {
            console.log("Compiling circuits...");
            await ZKGeoPointProviderCircuitProof.compile();
            await ZKGeoPointInPolygonProof.compile();
            console.log("Compilation complete!")
        }

        brasovCenterPolygon = new ThreePointPolygon({
            vertice1: new GeoPoint({
                latitude: Int64.from(4567567),
                longitude: Int64.from(2555484),
                factor: Int64.from(10n ** 5n),
            }),
            vertice2: new GeoPoint({
                latitude: Int64.from(4561431),
                longitude: Int64.from(2561711),
                factor: Int64.from(10n ** 5n),
            }),
            vertice3: new GeoPoint({
                latitude: Int64.from(4567369),
                longitude: Int64.from(2567497),
                factor: Int64.from(10n ** 5n),
            })
        });

        brasovCenterCoordinates = new GeoPoint({
                latitude: Int64.from(4565267),
                longitude: Int64.from(2561046),
                factor: Int64.from(10n ** 5n),
        });
        const brasovCenterCoordinatesSourced: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(brasovCenterCoordinates);

        notBrasovCenterCoordinates = new GeoPoint({
                latitude: Int64.from(4573351),
                longitude: Int64.from(2563860),
                factor: Int64.from(10n ** 5n),
        });

        const notBrasovCenterCoordinatesSourced: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(notBrasovCenterCoordinates);

        notInRomaniaCoordinates = new GeoPoint({
                latitude: Int64.from(1111111),
                longitude: Int64.from(1111111),
                factor: Int64.from(10n ** 5n),
        });

        const notInRomaniaCoordinatesSourced: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(notInRomaniaCoordinates);

        proofBrasovCenterCoordinatesInBrasovCenterPolygon = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
            brasovCenterCoordinatesSourced,
            brasovCenterPolygon
        );

        proofNotBrasovCenterCoordinatesInBrasovCenterPolygon = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
            notBrasovCenterCoordinatesSourced,
            brasovCenterPolygon
        );

        proofNotInRomaniaCoordinatesNotInBrasovCenterPolygon = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
            notInRomaniaCoordinatesSourced,
            brasovCenterPolygon,
        );

    });

    describe('isPointIn3PointPolygon', () => {

        describe('when the point is inside the polygon', () => {
            it('returns true', async () => {

                const publicOutput: GeoPointInPolygonCommitment = proofBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when the point is outside the polygon', () => {
            it('returns false', async () => {
                const publicOutput: GeoPointInPolygonCommitment = proofNotBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

    });

    describe('OR/AND combinaton', () => {
        let insideCoordinate1: GeoPoint;
        let insideCoordinate2: GeoPoint;
        let insideCoordinate3: GeoPoint;

        let insidePolygon1: ThreePointPolygon;
        let insidePolygon2: ThreePointPolygon;
        let outsidePolygon1: ThreePointPolygon;
        let outsidePolygon2: ThreePointPolygon;

        let proofInsideCoordinate1InInsidePolygon1: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate2InInsidePolygon1: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate3InInsidePolygon1: Proof<Empty, GeoPointInPolygonCommitment>;

        let proofInsideCoordinate1InInsidePolygon2: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate2InInsidePolygon2: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate3InInsidePolygon2: Proof<Empty, GeoPointInPolygonCommitment>;

        let proofInsideCoordinate1NotInOutsidePolygon1: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate2NotInOutsidePolygon1: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate3NotInOutsidePolygon1: Proof<Empty, GeoPointInPolygonCommitment>;

        let proofInsideCoordinate1NotInOutsidePolygon2: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate2NotInOutsidePolygon2: Proof<Empty, GeoPointInPolygonCommitment>;
        let proofInsideCoordinate3NotInOutsidePolygon2: Proof<Empty, GeoPointInPolygonCommitment>;

        let orProofForInsideOutsideC1: Proof<Empty, GeoPointInPolygonCommitment>;
        let orProofForInsideInsideC1: Proof<Empty, GeoPointInPolygonCommitment>;
        let orProofForOutsideOutsideC1: Proof<Empty, GeoPointInPolygonCommitment>;
        let andProoForInsideOutsideC1: Proof<Empty, GeoPointInPolygonCommitment>;
        let andProofForInsideInsideC1: Proof<Empty, GeoPointInPolygonCommitment>;
        let andProofForOutsideOutsideC1: Proof<Empty, GeoPointInPolygonCommitment>;

        beforeAll(async () => {

            insideCoordinate1 = InternalStructuresInterface.geographicalPointFromNumber(25.61081, 45.65288);
            
            const insideCoordinate1Sourced: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(insideCoordinate1);

            insideCoordinate2 = InternalStructuresInterface.geographicalPointFromNumber(25.61086, 45.65271);

            const insideCoordinate2Sourced: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(insideCoordinate2);

            insideCoordinate3 = InternalStructuresInterface.geographicalPointFromNumber(25.61115, 45.65284);
            const insideCoordinate3Sourced: GeoPointProviderCircuitProof = await GeoPointProviderCircuit.fromLiteralGeoPoint(insideCoordinate3);

            insidePolygon1 = new ThreePointPolygon({
                vertice1: InternalStructuresInterface.geographicalPointFromNumber(25.61074,45.65292),
                vertice2: InternalStructuresInterface.geographicalPointFromNumber(25.61081,45.65267),
                vertice3: InternalStructuresInterface.geographicalPointFromNumber(25.61133,45.65285),
            });

            insidePolygon2 = new ThreePointPolygon({
                vertice1: InternalStructuresInterface.geographicalPointFromNumber(25.61053,45.65300),
                vertice2: InternalStructuresInterface.geographicalPointFromNumber(25.61086,45.65248),
                vertice3: InternalStructuresInterface.geographicalPointFromNumber(25.61130,45.65299),
            });

            outsidePolygon1 = new ThreePointPolygon({
                vertice1: InternalStructuresInterface.geographicalPointFromNumber(25.61004, 45.65272),
                vertice2: InternalStructuresInterface.geographicalPointFromNumber(25.61018,45.65244),
                vertice3: InternalStructuresInterface.geographicalPointFromNumber(25.61043,45.65272),
            });

            outsidePolygon2 = new ThreePointPolygon({
                vertice1: InternalStructuresInterface.geographicalPointFromNumber(25.61096,45.65236),
                vertice2: InternalStructuresInterface.geographicalPointFromNumber(25.61112,45.65210),
                vertice3: InternalStructuresInterface.geographicalPointFromNumber(25.61132,45.65235),
            });


            proofInsideCoordinate1InInsidePolygon1 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate1Sourced,
                insidePolygon1,
            );

            proofInsideCoordinate2InInsidePolygon1 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate2Sourced,
                insidePolygon1,
            );

            proofInsideCoordinate3InInsidePolygon1 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate3Sourced,
                insidePolygon1,
            );

            proofInsideCoordinate1InInsidePolygon2 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate1Sourced,
                insidePolygon2,
            );

            proofInsideCoordinate2InInsidePolygon2 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate2Sourced,
                insidePolygon2,
            );

            proofInsideCoordinate3InInsidePolygon2 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate3Sourced,
                insidePolygon2,
            );

            proofInsideCoordinate1NotInOutsidePolygon1 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate1Sourced,
                outsidePolygon1,
            );

            proofInsideCoordinate2NotInOutsidePolygon1 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate2Sourced,
                outsidePolygon1,
            );

            proofInsideCoordinate3NotInOutsidePolygon1 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate3Sourced,
                outsidePolygon1,
            );

            proofInsideCoordinate1NotInOutsidePolygon2 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate1Sourced,
                outsidePolygon2,
            );
            
            proofInsideCoordinate2NotInOutsidePolygon2 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate2Sourced,
                outsidePolygon2,
            );

            proofInsideCoordinate3NotInOutsidePolygon2 = await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(
                insideCoordinate3Sourced,
                outsidePolygon2,
            );

            orProofForInsideOutsideC1 = await GeoPointInPolygonCombinerCircuit.OR(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1NotInOutsidePolygon1,
            );

            orProofForInsideInsideC1 = await GeoPointInPolygonCombinerCircuit.OR(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1InInsidePolygon2,
            );
            orProofForOutsideOutsideC1 = await GeoPointInPolygonCombinerCircuit.OR(
                proofInsideCoordinate1NotInOutsidePolygon1,
                proofInsideCoordinate1NotInOutsidePolygon2,
            );

            andProoForInsideOutsideC1 = await GeoPointInPolygonCombinerCircuit.AND(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1NotInOutsidePolygon1,
            )
            
            andProofForInsideInsideC1 = await GeoPointInPolygonCombinerCircuit.AND(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1InInsidePolygon2,
            );


            });


        describe('when inside coordinates are checked against inside polygon of Poygon 1', () => {
            it('returns proof inside polygon', async () => {
                const publicOutput1: GeoPointInPolygonCommitment = proofInsideCoordinate1InInsidePolygon1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));

                const publicOutput2: GeoPointInPolygonCommitment = proofInsideCoordinate2InInsidePolygon1.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(true));

                const publicOutput3: GeoPointInPolygonCommitment = proofInsideCoordinate3InInsidePolygon1.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(true));
            });
        });

        describe('when inside coordinates are checked against inside polygon of Poygon 2', () => {
            it('returns proof inside polygon', async () => {
                const publicOutput1: GeoPointInPolygonCommitment = proofInsideCoordinate1InInsidePolygon2.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));

                const publicOutput2: GeoPointInPolygonCommitment = proofInsideCoordinate2InInsidePolygon2.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(true));

                const publicOutput3: GeoPointInPolygonCommitment = proofInsideCoordinate3InInsidePolygon2.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(true));
            });
        });

        describe('when coordinates are checked against outside polygon 1', () => {
            it('returns proof outside polygon', async () => {
                const publicOutput1: GeoPointInPolygonCommitment = proofInsideCoordinate1NotInOutsidePolygon1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));

                const publicOutput2: GeoPointInPolygonCommitment = proofInsideCoordinate2NotInOutsidePolygon1.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(false));

                const publicOutput3: GeoPointInPolygonCommitment = proofInsideCoordinate3NotInOutsidePolygon1.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(false));
            });
        });

        describe('when coordinates are checked against outside polygon 2', () => {
            it('returns proof outside polygon', async () => {
                const publicOutput1: GeoPointInPolygonCommitment = proofInsideCoordinate1NotInOutsidePolygon2.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));

                const publicOutput2: GeoPointInPolygonCommitment = proofInsideCoordinate2NotInOutsidePolygon2.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(false));

                const publicOutput3: GeoPointInPolygonCommitment = proofInsideCoordinate3NotInOutsidePolygon2.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(false));
            });
        });

        describe('when OR is invoked with inside/outside proofs', () => {
            it('returns proof inside polygon', async () => {
                const publicOutput: GeoPointInPolygonCommitment = orProofForInsideOutsideC1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when AND is invoked with inside/outside proofs', () => {
            it('returns proof outside polygon', async () => {
                const publicOutput: GeoPointInPolygonCommitment = andProoForInsideOutsideC1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when OR inside/outside proof is ANDed with a proof outside polygon', () => {
            it('returns proof outside polygon', async () => {
                const andInsideOutsideProofAndOutsideProof = await GeoPointInPolygonCombinerCircuit.AND(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1NotInOutsidePolygon1,
                );

                const publicOutput: GeoPointInPolygonCommitment = andInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when AND inside/outside proof is ANDed with a proof outside polygon', () => {
            it('returns proof outside polygon', async () => {
                const andInsideOutsideProofAndOutsideProof = await GeoPointInPolygonCombinerCircuit.AND(
                    andProoForInsideOutsideC1,
                    proofInsideCoordinate1NotInOutsidePolygon1,
                );

                const publicOutput: GeoPointInPolygonCommitment = andInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when OR inside/outside proof is ANDed with a proof inside polygon', () => {
            it('returns proof inside polygon', async () => {
                const andInsideOutsideProofAndOutsideProof = await GeoPointInPolygonCombinerCircuit.AND(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1InInsidePolygon1,
                );

                const publicOutput: GeoPointInPolygonCommitment = andInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when OR inside/outside proof is ORed with a proof inside polygon', () => {
            it('returns proof inside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await GeoPointInPolygonCombinerCircuit.OR(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1InInsidePolygon1,
                );

                const publicOutput: GeoPointInPolygonCommitment = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when AND inside/outside proof is ORed with OR inside/outside polygon', () => {
            it('returns proof inside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await GeoPointInPolygonCombinerCircuit.OR(
                    andProoForInsideOutsideC1,
                    orProofForInsideOutsideC1,
                );

                const publicOutput: GeoPointInPolygonCommitment = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when AND inside/outside proof is ORed with a OR outside/outside polygon', () => {
            it('returns proof outside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await GeoPointInPolygonCombinerCircuit.OR(
                    andProoForInsideOutsideC1,
                    orProofForOutsideOutsideC1,
                );

                const publicOutput: GeoPointInPolygonCommitment = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when OR inside/outside proof is ORed with a proof outside polygon', () => {
            it('returns proof inside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await GeoPointInPolygonCombinerCircuit.OR(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1NotInOutsidePolygon1,
                );

                const publicOutput: GeoPointInPolygonCommitment = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

    });
});
