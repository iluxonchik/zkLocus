import { Int64 } from "o1js";
import { ZKGeoPoint, ZKLatitude, ZKLongitude } from "../../api/api";
import { GeoPoint } from "../../model/Geography";

describe('ZKGeoPoint Class Tests', () => {
    it('testZKGeoPointConstructionWithCoordinates', () => {
        const latitude = new ZKLatitude(50);
        const longitude = new ZKLongitude(100);
        const zkGeoPoint = new ZKGeoPoint(latitude, longitude);
        expect(zkGeoPoint.latitude).toBe(latitude);
        expect(zkGeoPoint.longitude).toBe(longitude);
    });

    it('testZKGeoPointConstructionWithNumberType', () => {
        const latValue = 60;
        const longValue = 120;
        const zkGeoPoint = new ZKGeoPoint(latValue, longValue);
        expect(zkGeoPoint.latitude.raw).toBe(latValue);
        expect(zkGeoPoint.longitude.raw).toBe(longValue);
    });

    it('testZKGeoPointToRawValue', () => {
        const latitude = 70;
        const longitude = 140;
        const zkGeoPoint = new ZKGeoPoint(latitude, longitude);
        expect(zkGeoPoint.asRawValue).toEqual({ latitude, longitude });
    });

    it('testZKGeoPointToNormalizedValue', () => {
        const latitude = new ZKLatitude(35);
        const longitude = new ZKLongitude(75);
        const zkGeoPoint = new ZKGeoPoint(latitude, longitude);
        const normalized = zkGeoPoint.normalizedValue();

        expect(normalized.latitude).toEqual(latitude);
        expect(normalized.longitude).toEqual(longitude);

        expect(normalized.latitude.normalized).toEqual(35);
        expect(normalized.longitude.normalized).toEqual(75);
    });

    it('testZKGeoPointToZKValue', () => {
        const latitude = new ZKLatitude(20);
        const longitude = new ZKLongitude(80);
        const zkGeoPoint = new ZKGeoPoint(latitude, longitude);
        const geoPoint = zkGeoPoint.toZKValue();
        expect(geoPoint).toBeInstanceOf(GeoPoint);
    });
    
});
