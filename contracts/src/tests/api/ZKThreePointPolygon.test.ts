import { RawCoordinates } from "../../api/Types";
import { ZKThreePointPolygon } from "../../api/models/ZKThreePointPolygon";
import { ZKGeoPoint } from "../../api/models/ZKGeoPoint";
import { ZKLongitude } from "../../api/models/ZKLongitude";
import { ZKLatitude } from "../../api/models/ZKLatitude";
import { ThreePointPolygon } from "../../model/Geography";
import { Poseidon } from "o1js";

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

    it('testZKThreePointPolygonHash', () => {
        const vertex1 = new ZKGeoPoint(new ZKLatitude(10), new ZKLongitude(20));
        const vertex2 = new ZKGeoPoint(new ZKLatitude(30), new ZKLongitude(40));
        const vertex3 = new ZKGeoPoint(new ZKLatitude(50), new ZKLongitude(60));
        const polygon = new ZKThreePointPolygon(vertex1, vertex2, vertex3);
        const hash = polygon.hash();
        const expectedHash = Poseidon.hash([vertex1.hash(), vertex2.hash(), vertex3.hash()]);
        expect(hash).toEqual(expectedHash);
    });

    it('testZKThreePointPolygonCombinedHashWithSinglePolygon', () => {
        const vertex = new ZKGeoPoint(new ZKLatitude(10), new ZKLongitude(20));
        const polygon = new ZKThreePointPolygon(vertex, vertex, vertex);
        const combinedHash = polygon.combinedHash([]);
        expect(combinedHash).toEqual(polygon.hash());
    });

    it('testZKThreePointPolygonCombinedHashWithMultiplePolygons', () => {
        const vertex1 = new ZKGeoPoint(new ZKLatitude(10), new ZKLongitude(20));
        const vertex2 = new ZKGeoPoint(new ZKLatitude(30), new ZKLongitude(40));
        const polygon1 = new ZKThreePointPolygon(vertex1, vertex1, vertex1);
        const polygon2 = new ZKThreePointPolygon(vertex2, vertex2, vertex2);
        const combinedHash = polygon1.combinedHash([polygon2]);
        const expectedHash = Poseidon.hash([polygon1.hash(), polygon2.hash()]);
        expect(combinedHash).toEqual(expectedHash);
    });

    it('testZKThreePointPolygonStaticCombinedHashWithSinglePolygon', () => {
        const vertex = new ZKGeoPoint(new ZKLatitude(10), new ZKLongitude(20));
        const polygon = new ZKThreePointPolygon(vertex, vertex, vertex);
        const combinedHash = ZKThreePointPolygon.combinedHash([polygon]);
        expect(combinedHash).toEqual(polygon.hash());
    });

    it('testZKThreePointPolygonStaticCombinedHashWithMultiplePolygons', () => {
        const vertex1 = new ZKGeoPoint(new ZKLatitude(10), new ZKLongitude(20));
        const vertex2 = new ZKGeoPoint(new ZKLatitude(30), new ZKLongitude(40));
        const polygon1 = new ZKThreePointPolygon(vertex1, vertex1, vertex1);
        const polygon2 = new ZKThreePointPolygon(vertex2, vertex2, vertex2);
        const combinedHash = ZKThreePointPolygon.combinedHash([polygon1, polygon2]);
        const expectedHash = Poseidon.hash([polygon1.hash(), polygon2.hash()]);
        expect(combinedHash).toEqual(expectedHash);
    });

    it('testZKThreePointPolygonCombinedHashWithEmptyArray', () => {
        const vertex = new ZKGeoPoint(new ZKLatitude(10), new ZKLongitude(20));
        const polygon = new ZKThreePointPolygon(vertex, vertex, vertex);
        expect(() => polygon.combinedHash([])).not.toThrow();
    });

    it('testZKThreePointPolygonStaticCombinedHashWithEmptyArray Throws an Error', () => {
        expect(() => ZKThreePointPolygon.combinedHash([])).toThrow();
        });

        // Testing conversion methods
it('testZKThreePointPolygonToZKValueConversion', () => {
    const vertex1 = new ZKGeoPoint(new ZKLatitude(1), new ZKLongitude(1));
    const vertex2 = new ZKGeoPoint(new ZKLatitude(-10), new ZKLongitude(-10));
    const vertex3 = new ZKGeoPoint(new ZKLatitude(90), new ZKLongitude(90));
    const polygon = new ZKThreePointPolygon(vertex1, vertex2, vertex3);
    const threePointPolygon = polygon.toZKValue();
    expect(threePointPolygon).toBeInstanceOf(ThreePointPolygon);
    expect(threePointPolygon.vertice1).toEqual(vertex1.toZKValue());
    expect(threePointPolygon.vertice2).toEqual(vertex2.toZKValue());
    expect(threePointPolygon.vertice3).toEqual(vertex3.toZKValue());
});

// Testing factory method
it('testZKThreePointPolygonFromThreePointPolygonCreation', () => {
    const vertex1 = new ZKGeoPoint(new ZKLatitude(1), new ZKLongitude(1));
    const vertex2 = new ZKGeoPoint(new ZKLatitude(-10), new ZKLongitude(-10));
    const vertex3 = new ZKGeoPoint(new ZKLatitude(90), new ZKLongitude(90));
    const threePointPolygon = new ThreePointPolygon({ 
        vertice1: vertex1.toZKValue(), 
        vertice2: vertex2.toZKValue(), 
        vertice3: vertex3.toZKValue() 
    });
    const zkPolygon = ZKThreePointPolygon.fromThreePointPolygon(threePointPolygon);
    expect(zkPolygon.vertices[0].isEquals(vertex1)).toBe(true);
    expect(zkPolygon.vertices[1].isEquals(vertex2)).toBe(true);
    expect(zkPolygon.vertices[2].isEquals(vertex3)).toBe(true);
});


});
