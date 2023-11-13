import { ProoveCoordinatesIn3dPolygonArgumentsValues } from '../model/Commitment';
/** Intermediate Circuits **/
function assertCoordinateAndPolygonValuesAreValid(point, polygon) {
    // First, ensure all of the coordinates are valid
    point.assertIsValid();
    polygon.vertice1.assertIsValid();
    polygon.vertice2.assertIsValid();
    polygon.vertice3.assertIsValid();
    // Next, ensure all of the points have the same factor
    const expectedFactor = point.point.factor;
    expectedFactor.assertEquals(polygon.vertice1.factor);
    expectedFactor.assertEquals(polygon.vertice2.factor);
    expectedFactor.assertEquals(polygon.vertice3.factor);
    return new ProoveCoordinatesIn3dPolygonArgumentsValues({
        point: point.point,
        polygon: polygon,
    });
}
//# sourceMappingURL=Asserters.js.map