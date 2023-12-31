import { Int64 } from "o1js";
import { ProoveCoordinatesIn3dPolygonArgumentsValues } from '../model/private/Commitment';
import { GeoPoint, ThreePointPolygon } from '../model/Geography';


function assertCoordinateAndPolygonValuesAreValid(
    point: GeoPoint,
    polygon: ThreePointPolygon
): ProoveCoordinatesIn3dPolygonArgumentsValues {
    // First, ensure all of the coordinates are valid
    point.assertIsValid();
    polygon.vertice1.assertIsValid();
    polygon.vertice2.assertIsValid();
    polygon.vertice3.assertIsValid();

    // Next, ensure all of the points have the same factor
    const expectedFactor: Int64 = point.factor;
    expectedFactor.assertEquals(polygon.vertice1.factor);
    expectedFactor.assertEquals(polygon.vertice2.factor);
    expectedFactor.assertEquals(polygon.vertice3.factor);

    return new ProoveCoordinatesIn3dPolygonArgumentsValues({
        point: point,
        polygon: polygon,
    });
}
