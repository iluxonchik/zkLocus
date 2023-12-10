import { ZKThreePointPolygon, ZKGeoPoint, ZKLatitude, ZKLongitude, RawCoordinates } from "../../api/api";
import { ThreePointPolygon } from "../../model/Geography";

describe('ZKThreePointPolygon Class Tests', () => {
    it('testZKThreePointPolygonConstructionWithGeoPoints', () => {
        const vertex1 = new ZKGeoPoint(new ZKLatitude(10), new ZKLongitude(20));
        const vertex2 = new ZKGeoPoint(new ZKLatitude(30), new ZKLongitude(40));
        const vertex3 = new ZKGeoPoint(new ZKLatitude(50), new ZKLongitude(60));
        const polygon = new ZKThreePointPolygon(vertex1, vertex2, vertex3);
        expect(polygon.vertices).toEqual([vertex1, vertex2, vertex3]);
    });

    it('testZKThreePointPolygonConstructionWithRawCoordinates', () => {
        const vertex1: RawCoordinates = { latitude: '70', longitude: '80' };
        const vertex2: RawCoordinates = { latitude: '90', longitude: '100' };
        const vertex3: RawCoordinates = { latitude: '10', longitude: '120' };
        const polygon = new ZKThreePointPolygon(vertex1, vertex2, vertex3);
        expect(polygon.vertices[0].latitude.raw).toBe(vertex1.latitude);
        expect(polygon.vertices[1].longitude.raw).toBe(vertex2.longitude);
        expect(polygon.vertices[2].latitude.raw).toBe(vertex3.latitude);
        expect(polygon.vertices[2].longitude.raw).toBe(vertex3.longitude);

    });

    it('testZKThreePointPolygonToRawValue', () => {
        const vertex1 = new ZKGeoPoint(new ZKLatitude(-10), new ZKLongitude(140));
        const vertex2 = new ZKGeoPoint(new ZKLatitude(-20), new ZKLongitude(-160));
        const vertex3 = new ZKGeoPoint(new ZKLatitude(30), new ZKLongitude(180));
        const polygon = new ZKThreePointPolygon(vertex1, vertex2, vertex3);
        expect(polygon.rawValue()).toEqual([vertex1, vertex2, vertex3]);
    });

    it('testZKThreePointPolygonToNormalizedValue', () => {
        const vertex1 = new ZKGeoPoint(new ZKLatitude(-90), new ZKLongitude(-180));
        const vertex2 = new ZKGeoPoint(new ZKLatitude(90), new ZKLongitude(180));
        const vertex3 = new ZKGeoPoint(new ZKLatitude(0), new ZKLongitude(0));
        const polygon = new ZKThreePointPolygon(vertex1, vertex2, vertex3) as any; // Type casting to use extended methods
        const normalized = polygon.normalizedValue();
        expect(normalized).toEqual([
            vertex1.toZKValue(),
            vertex2.toZKValue(),
            vertex3.toZKValue()
        ]);
    });

    it('testZKThreePointPolygonToZKValue', () => {
        const vertex1 = new ZKGeoPoint(new ZKLatitude(1), new ZKLongitude(1));
        const vertex2 = new ZKGeoPoint(new ZKLatitude(-10), new ZKLongitude(-10));
        const vertex3 = new ZKGeoPoint(new ZKLatitude(90), new ZKLongitude(90));
        const polygon = new ZKThreePointPolygon(vertex1, vertex2, vertex3)
        const threePointPolygon = polygon.toZKValue();
        expect(threePointPolygon).toBeInstanceOf(ThreePointPolygon);
    });
});
