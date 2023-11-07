import { Bool, Field, Int64 } from "o1js";
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
        const num_digits_after_decimal_in_logitude: number = InternalStructuresInterface.countDecimals(longitude);
        const num_digits_after_decimal_in_latitude: number = InternalStructuresInterface.countDecimals(latitude);

        if (num_digits_after_decimal_in_latitude != num_digits_after_decimal_in_logitude) {
            throw new Error('Number of digits after decimal in longitude and latitude must be equal');
        }

        if (num_digits_after_decimal_in_latitude > 7) {
            throw new Error('Number of digits after decimal in longitude and latitude must be less than 7');
        }
        
        const normalizedLatitude: number = latitude * (10 ** num_digits_after_decimal_in_latitude);
        const normalizedLongitude: number = longitude * (10 ** num_digits_after_decimal_in_logitude);
        const factor: number = 10 ** num_digits_after_decimal_in_latitude;

        return new NoncedGeographicalPoint({
            point: new GeographicalPoint({
              latitude: Int64.from(normalizedLatitude),
              longitude: Int64.from(normalizedLongitude),
              factor: Int64.from(factor),
            }),
            nonce: Field(Math.floor(Math.random() * 1000000)),
          }); 
    }
}

const isProofsEnalbled: boolean = true;
describe('isPointIn3PointPolygon', () => {

    beforeAll(async () => {
        if (isProofsEnalbled) await CoordinatesInPolygon.compile();
    });

    describe('when the point is inside the polygon', () => {
        it('returns true', async() => {

            let brasovCenterCoordinates1 = new NoncedGeographicalPoint({
                point: new GeographicalPoint({
                  latitude: Int64.from(4565267),
                  longitude: Int64.from(2561046),
                  factor: Int64.from(10n ** 5n),
                }),
                nonce: Field(Math.floor(Math.random() * 1000000)),
              });

              let brasovCenterPolygon = new ThreePointPolygon({
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

              const proofBrasovCenterCoordinatesInBrasovCenterPolygon: any = await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
                    brasovCenterCoordinates1,
                    brasovCenterPolygon
            );

                const publicOutput: CoordinateProofState = proofBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput;
                // NOTE: if it does not work, try adding cast to Boolean:   
                //const isPointInPolyonObtained: Boolean = Boolean(publicOutput);
                const isInPolygonObtained: Bool = Bool(publicOutput.isInPolygon);
                expect(isInPolygonObtained).toEqual(Bool(true));
        });
    });

});

