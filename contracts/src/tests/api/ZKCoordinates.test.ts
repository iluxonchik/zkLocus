import { ZKLongitude } from "../../api/models/ZKLongitude";
import { ZKLatitude } from "../../api/models/ZKLatitude";
import { ZKCoordinate } from "../../api/models/ZKCoordinate";

describe('ZKCoordinate, ZKLatitude, and ZKLongitude Tests', () => {
    it('testZKCoordinateWithValidNumber', () => {
        const value = 150;
        const zkCoordinate = new ZKCoordinate(value);
        expect(zkCoordinate.raw).toBe(value);
    });

    it('testZKCoordinateWithInvalidNumber', () => {
        const value = 200; // Invalid longitude value
        expect(() => new ZKCoordinate(value)).toThrow();
    });

    it('testZKLatitudeWithValidNumber', () => {
        const value = 45;
        const zkLatitude = new ZKLatitude(value);
        expect(zkLatitude.raw).toBe(value);
    });

    it('testZKLatitudeWithInvalidNumber', () => {
        const value = 100; // Invalid latitude value
        expect(() => new ZKLatitude(value)).toThrow();
    });

    it('testZKLongitudeWithValidNumber', () => {
        const value = -120;
        const zkLongitude = new ZKLongitude(value);
        expect(zkLongitude.raw).toBe(value);
    });

    it('testZKLongitudeWithInvalidNumber', () => {
        const value = -190; // Invalid longitude value
        expect(() => new ZKLongitude(value)).toThrow();
    });
});
