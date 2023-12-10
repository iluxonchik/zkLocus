import { ZKCoordinate, ZKLatitude, ZKLongitude } from "../../api/Models";

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
});/*
    This contains the API for zkLocus. The API is designed to abstract away the underlying zero-knowledge circutiry logic, and focus
    on providing a clear, concise and intuitive API for the end user. The API is designed adehering to the vision of zkLocus of allowing
    for the sharing of optionally private geolocation data, that is extendable, customizable, and interoperable across the varioius
    computational environments, such as blockchain (on-chain), off-chain, mobile, web and IoT.

    The API's design levarages the recursive zkSNARKs architecture o zkLocus to its fullest extent. As such, the proofs are
    naturally recursive and combinable with one another, just like in the low-level zkLocus API.

    This API is designed specifically for TypeScript, and it's inspired by APIs in the Python ecosystem such as BeautifulSoup, where powerful
    and complex functionality is abstracted away from the user, while exposing a clear and concise interface to the end user.
*/
// Utility Types
export type numberType = number | string; // Represents the number type
// Named Tuple Equivalent in TypeScript
export interface RawCoordinates {
    latitude: numberType;
    longitude: numberType;
}

