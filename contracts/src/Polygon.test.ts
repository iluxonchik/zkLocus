import { Bool, Empty, Field, Int64, Proof } from "o1js";
import { CoordinateProofState, CoordinatesInPolygon, GeographicalPoint, NoncedGeographicalPoint, ThreePointPolygon } from "./Polygon";

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

    static noncedGeographicalPointFromNumber(latitude: number, longitude: number): NoncedGeographicalPoint {
        const geographicalPoint: GeographicalPoint = InternalStructuresInterface.geographicalPointFromNumber(latitude, longitude);
        const nonce: Field = Field(Math.floor(Math.random() * 1000000));
        return new NoncedGeographicalPoint({
            point: geographicalPoint,
            nonce: nonce,
        });
    }

    static geographicalPointFromNumber(latitude: number, longitude: number): GeographicalPoint {
        const num_digits_after_decimal_in_logitude: number = InternalStructuresInterface.countDecimals(longitude);
        const num_digits_after_decimal_in_latitude: number = InternalStructuresInterface.countDecimals(latitude);

        const larger_value: number = Math.max(num_digits_after_decimal_in_latitude, num_digits_after_decimal_in_logitude);

        if (larger_value > 8) {
            throw new Error('Number of digits after decimal in longitude and latitude must be less than 8');
        }

        const normalizedLatitude: number = latitude * (10 ** larger_value);
        const normalizedLongitude: number = longitude * (10 ** larger_value);
        const factor: number = 10 ** larger_value;

        const point: GeographicalPoint = new GeographicalPoint({
            latitude: Int64.from(normalizedLatitude),
            longitude: Int64.from(normalizedLongitude),
            factor: Int64.from(factor),
        });
        return point;
    }
}

const isProofsEnalbled: boolean = true;
describe('CoordinatesInPolygon', () => {

    let brasovCenterPolygon: ThreePointPolygon;
    let brasovCenterCoordinates: NoncedGeographicalPoint;
    let notBrasovCenterCoordinates: NoncedGeographicalPoint;
    let notInRomaniaCoordinates: NoncedGeographicalPoint;

    let proofBrasovCenterCoordinatesInBrasovCenterPolygon: Proof<undefined, CoordinateProofState>;
    let proofNotBrasovCenterCoordinatesInBrasovCenterPolygon: Proof<undefined, CoordinateProofState>;
    let proofNotInRomaniaCoordinatesNotInBrasovCenterPolygon: Proof<undefined, CoordinateProofState>;


    beforeAll(async () => {

        if (isProofsEnalbled) await CoordinatesInPolygon.compile();

        brasovCenterPolygon = new ThreePointPolygon({
            vertice1: new GeographicalPoint({
                latitude: Int64.from(4567567),
                longitude: Int64.from(2555484),
                factor: Int64.from(10n ** 5n),
            }),
            vertice2: new GeographicalPoint({
                latitude: Int64.from(4561431),
                longitude: Int64.from(2561711),
                factor: Int64.from(10n ** 5n),
            }),
            vertice3: new GeographicalPoint({
                latitude: Int64.from(4567369),
                longitude: Int64.from(2567497),
                factor: Int64.from(10n ** 5n),
            })
        });

        brasovCenterCoordinates = new NoncedGeographicalPoint({
            point: new GeographicalPoint({
                latitude: Int64.from(4565267),
                longitude: Int64.from(2561046),
                factor: Int64.from(10n ** 5n),
            }),
            nonce: Field(Math.floor(Math.random() * 1000000)),
        });

        notBrasovCenterCoordinates = new NoncedGeographicalPoint({
            point: new GeographicalPoint({
                latitude: Int64.from(4573351),
                longitude: Int64.from(2563860),
                factor: Int64.from(10n ** 5n),
            }),
            nonce: Field(Math.floor(Math.random() * 1000000)),
        });

        notInRomaniaCoordinates = new NoncedGeographicalPoint({
            point: new GeographicalPoint({
                latitude: Int64.from(1111111),
                longitude: Int64.from(1111111),
                factor: Int64.from(10n ** 5n),
            }),
            nonce: Field(Math.floor(Math.random() * 1000000)),
        });

        proofBrasovCenterCoordinatesInBrasovCenterPolygon = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
            brasovCenterCoordinates,
            brasovCenterPolygon
        );

        proofNotBrasovCenterCoordinatesInBrasovCenterPolygon = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
            notBrasovCenterCoordinates,
            brasovCenterPolygon
        );

        proofNotInRomaniaCoordinatesNotInBrasovCenterPolygon = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
            notInRomaniaCoordinates,
            brasovCenterPolygon,
        );

    });

    describe('isPointIn3PointPolygon', () => {

        describe('when the point is inside the polygon', () => {
            it('returns true', async () => {

                const publicOutput: CoordinateProofState = proofBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when the point is outside the polygon', () => {
            it('returns false', async () => {
                const publicOutput: CoordinateProofState = proofNotBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

    });

    describe('OR/AND combinaton', () => {
        let insideCoordinate1: NoncedGeographicalPoint;
        let insideCoordinate2: NoncedGeographicalPoint;
        let insideCoordinate3: NoncedGeographicalPoint;

        let insidePolygon1: ThreePointPolygon;
        let insidePolygon2: ThreePointPolygon;
        let outsidePolygon1: ThreePointPolygon;
        let outsidePolygon2: ThreePointPolygon;

        let proofInsideCoordinate1InInsidePolygon1: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate2InInsidePolygon1: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate3InInsidePolygon1: Proof<Empty, CoordinateProofState>;

        let proofInsideCoordinate1InInsidePolygon2: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate2InInsidePolygon2: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate3InInsidePolygon2: Proof<Empty, CoordinateProofState>;

        let proofInsideCoordinate1NotInOutsidePolygon1: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate2NotInOutsidePolygon1: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate3NotInOutsidePolygon1: Proof<Empty, CoordinateProofState>;

        let proofInsideCoordinate1NotInOutsidePolygon2: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate2NotInOutsidePolygon2: Proof<Empty, CoordinateProofState>;
        let proofInsideCoordinate3NotInOutsidePolygon2: Proof<Empty, CoordinateProofState>;

        let orProofForInsideOutsideC1: Proof<Empty, CoordinateProofState>;
        let orProofForInsideInsideC1: Proof<Empty, CoordinateProofState>;
        let orProofForOutsideOutsideC1: Proof<Empty, CoordinateProofState>;
        let andProoForInsideOutsideC1: Proof<Empty, CoordinateProofState>;
        let andProofForInsideInsideC1: Proof<Empty, CoordinateProofState>;
        let andProofForOutsideOutsideC1: Proof<Empty, CoordinateProofState>;

        beforeAll(async () => {

            insideCoordinate1 = InternalStructuresInterface.noncedGeographicalPointFromNumber(25.61081, 45.65288);
            insideCoordinate2 = InternalStructuresInterface.noncedGeographicalPointFromNumber(25.61086, 45.65271);
            insideCoordinate3 = InternalStructuresInterface.noncedGeographicalPointFromNumber(25.61115, 45.65284);

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


            proofInsideCoordinate1InInsidePolygon1 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate1,
                insidePolygon1,
            );

            proofInsideCoordinate2InInsidePolygon1 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate2,
                insidePolygon1,
            );

            proofInsideCoordinate3InInsidePolygon1 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate3,
                insidePolygon1,
            );

            proofInsideCoordinate1InInsidePolygon2 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate1,
                insidePolygon2,
            );

            proofInsideCoordinate2InInsidePolygon2 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate2,
                insidePolygon2,
            );

            proofInsideCoordinate3InInsidePolygon2 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate3,
                insidePolygon2,
            );

            proofInsideCoordinate1NotInOutsidePolygon1 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate1,
                outsidePolygon1,
            );

            proofInsideCoordinate2NotInOutsidePolygon1 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate2,
                outsidePolygon1,
            );

            proofInsideCoordinate3NotInOutsidePolygon1 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate3,
                outsidePolygon1,
            );

            proofInsideCoordinate1NotInOutsidePolygon2 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate1,
                outsidePolygon2,
            );
            
            proofInsideCoordinate2NotInOutsidePolygon2 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate2,
                outsidePolygon2,
            );

            proofInsideCoordinate3NotInOutsidePolygon2 = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                insideCoordinate3,
                outsidePolygon2,
            );

            orProofForInsideOutsideC1 = await CoordinatesInPolygon.OR(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1NotInOutsidePolygon1,
            );

            orProofForInsideInsideC1 = await CoordinatesInPolygon.OR(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1InInsidePolygon2,
            );
            orProofForOutsideOutsideC1 = await CoordinatesInPolygon.OR(
                proofInsideCoordinate1NotInOutsidePolygon1,
                proofInsideCoordinate1NotInOutsidePolygon2,
            );

            andProoForInsideOutsideC1 = await CoordinatesInPolygon.AND(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1NotInOutsidePolygon1,
            );
            
            andProofForInsideInsideC1 = await CoordinatesInPolygon.AND(
                proofInsideCoordinate1InInsidePolygon1,
                proofInsideCoordinate1InInsidePolygon2,
            );


            });


        describe('when inside coordinates are checked against inside polygon of Poygon 1', () => {
            it('returns proof inside polygon', async () => {
                const publicOutput1: CoordinateProofState = proofInsideCoordinate1InInsidePolygon1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));

                const publicOutput2: CoordinateProofState = proofInsideCoordinate2InInsidePolygon1.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(true));

                const publicOutput3: CoordinateProofState = proofInsideCoordinate3InInsidePolygon1.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(true));
            });
        });

        describe('when inside coordinates are checked against inside polygon of Poygon 2', () => {
            it('returns proof inside polygon', async () => {
                const publicOutput1: CoordinateProofState = proofInsideCoordinate1InInsidePolygon2.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));

                const publicOutput2: CoordinateProofState = proofInsideCoordinate2InInsidePolygon2.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(true));

                const publicOutput3: CoordinateProofState = proofInsideCoordinate3InInsidePolygon2.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(true));
            });
        });

        describe('when coordinates are checked against outside polygon 1', () => {
            it('returns proof outside polygon', async () => {
                const publicOutput1: CoordinateProofState = proofInsideCoordinate1NotInOutsidePolygon1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));

                const publicOutput2: CoordinateProofState = proofInsideCoordinate2NotInOutsidePolygon1.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(false));

                const publicOutput3: CoordinateProofState = proofInsideCoordinate3NotInOutsidePolygon1.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(false));
            });
        });

        describe('when coordinates are checked against outside polygon 2', () => {
            it('returns proof outside polygon', async () => {
                const publicOutput1: CoordinateProofState = proofInsideCoordinate1NotInOutsidePolygon2.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput1 .isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));

                const publicOutput2: CoordinateProofState = proofInsideCoordinate2NotInOutsidePolygon2.publicOutput;
                const isInPolygonObtained2: Bool = Bool(publicOutput2.isInPolygon);
                expect(isInPolygonObtained2).toEqual(Bool(false));

                const publicOutput3: CoordinateProofState = proofInsideCoordinate3NotInOutsidePolygon2.publicOutput;
                const isInPolygonObtained3: Bool = Bool(publicOutput3.isInPolygon);
                expect(isInPolygonObtained3).toEqual(Bool(false));
            });
        });

        describe('when OR is invoked with inside/outside proofs', () => {
            it('returns proof inside polygon', async () => {
                const publicOutput: CoordinateProofState = orProofForInsideOutsideC1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when AND is invoked with inside/outside proofs', () => {
            it('returns proof outside polygon', async () => {
                const publicOutput: CoordinateProofState = andProoForInsideOutsideC1.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when OR inside/outside proof is ANDed with a proof outside polygon', () => {
            it('returns proof outside polygon', async () => {
                const andInsideOutsideProofAndOutsideProof = await CoordinatesInPolygon.AND(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1NotInOutsidePolygon1,
                );

                const publicOutput: CoordinateProofState = andInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when AND inside/outside proof is ANDed with a proof outside polygon', () => {
            it('returns proof outside polygon', async () => {
                const andInsideOutsideProofAndOutsideProof = await CoordinatesInPolygon.AND(
                    andProoForInsideOutsideC1,
                    proofInsideCoordinate1NotInOutsidePolygon1,
                );

                const publicOutput: CoordinateProofState = andInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when OR inside/outside proof is ANDed with a proof inside polygon', () => {
            it('returns proof inside polygon', async () => {
                const andInsideOutsideProofAndOutsideProof = await CoordinatesInPolygon.AND(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1InInsidePolygon1,
                );

                const publicOutput: CoordinateProofState = andInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when OR inside/outside proof is ORed with a proof inside polygon', () => {
            it('returns proof inside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await CoordinatesInPolygon.OR(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1InInsidePolygon1,
                );

                const publicOutput: CoordinateProofState = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when AND inside/outside proof is ORed with OR inside/outside polygon', () => {
            it('returns proof inside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await CoordinatesInPolygon.OR(
                    andProoForInsideOutsideC1,
                    orProofForInsideOutsideC1,
                );

                const publicOutput: CoordinateProofState = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

        describe('when AND inside/outside proof is ORed with a OR outside/outside polygon', () => {
            it('returns proof outside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await CoordinatesInPolygon.OR(
                    andProoForInsideOutsideC1,
                    orProofForOutsideOutsideC1,
                );

                const publicOutput: CoordinateProofState = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(false));
            });
        });

        describe('when OR inside/outside proof is ORed with a proof outside polygon', () => {
            it('returns proof inside polygon', async () => {
                const orInsideOutsideProofAndOutsideProof = await CoordinatesInPolygon.OR(
                    orProofForInsideOutsideC1,
                    proofInsideCoordinate1NotInOutsidePolygon1,
                );

                const publicOutput: CoordinateProofState = orInsideOutsideProofAndOutsideProof.publicOutput;
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
            });
        });

    });
});
