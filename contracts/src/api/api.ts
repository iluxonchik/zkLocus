/*
    This contains the API for zkLocus. The API is designed to abstract away the underlying zero-knowledge circutiry logic, and focus
    on providing a clear, concise and intuitive API for the end user. The API is designed adehering to the vision of zkLocus of allowing
    for the sharing of optionally private geolocation data, that is extendable, customizable, and interoperable across the varioius
    computational environments, such as blockchain (on-chain), off-chain, mobile, web and IoT.

    The API's design levarages the recursive zkSNARKs architecture o zkLocus to its fullest extent. As such, the proofs are
    naturally recursive and combinable with one another, just like in the low-level zkLocus API.

    This API is designed specifically for TypeScript, and it's inspired by APIs in the Python ecosystem such as BeautifulSoup, where powerful
    and complex functionality is abstracted away from the user, while exposing a clear and concise interface to the end user.
*/
import { Int64 } from "o1js";
import { GeoPoint, ThreePointPolygon } from "../model/Geography";

// Utility Types
export type numberType = number | string; // Represents the number type

// Named Tuple Equivalent in TypeScript
export interface RawCoordinates {
    latitude: numberType;
    longitude: numberType;
}

/*
    Represents interface that converts a type into a zkLocus value. 
    This is used to convert TypeScript types into zkLocus-supported types.

    Any type that implements ZKLocusAdopter becomes a type that "adopts" to zkLocus's internal types. Its ultimate purpose is to be used
    as a class decorator. Any class that gets decorated ZKLocusAdopter will be augmented with the additional properties and methods of the
    ZKLocusAdopter interface. As such, any class that gets decorated with with a function that returns a class that implements ZKLocusAdopter
    becomes an "adopter" of zkLocus, as it provides a way to convert the types into zkLocus types.

    The values are converted in the following order:
    1. rawValue: The value that the user provided. This value can be either an API type or a TypeScript native type. It gets converted into a normalized value.
    2. normalizedValue: The normalized value of the type. This value is the normalized raw value. This value is an
        API type, and should not be a TypeScript native type. It gets converted into a zkLocus value.
    3. toZKValue: The zkLocus value of the type. This is the value that will be used in zkLocus. This value must be of type

    Raw, normalized and ZK are the different states of the same value. The value begins as a raw value, and then it gets normalized, and then it gets converted into a zkLocus value.
*/
export interface ZKLocusAdopter<R, N, Z> {
    /*
        Returns the raw value of the type. This is the value that the user provided. This value can be either
        an API type or a TypeScript native type.
    */
    rawValue(): R;

    /*
        Returns the normalized value of the type. This value is the normalized raw value. This value is an
        API type, and should not be a TypeScript native type.

        A normalized value is easily convertible into a zkLocus value.
    */
    normalizedValue(): N;

    /*
        Returns the zkLocus value of the type. This is the value that will be used in zkLocus. This value must be of type
        the zkLocus implentation operats upon. For example, if the zkLocus implementation operates on Int64, then this
        value must be of type Int64.

        In practice, these value types are directly compatile the types used inside the recursive zkSNARKs circuits of zkLocus.

    */ 
    toZKValue(): Z;
}

/*
    This is the parent abstraction class for all zkLocus proofs. Any zkLocus proof is interpertable and abstractble by
    this type. It can load and convert proofs to JSON, combine proofs together, and verify them.

    Internally, it uses the zkLocus API to perform the operations. It also contains properties based on the
    proof structure.
*/
export class ZKLocusProof {
    // Properties based on proof structure...

    toJson(): string {
        // TODO: Implementation details...
        return JSON.stringify({});
    }

    static fromJson(jsonProof: string): ZKLocusProof { 
        // TODO: Implementation details...
        return new ZKLocusProof(/* parameters */);
    }

    async verify(): Promise<boolean> {
        // TODO: Implementation details...
        return true; // Placeholder
    }

    // Additional methods...
}

function ZKGeoPointToGeoPointAdopter<T extends new (...args: any[]) => ZKGeoPoint>(Base: T) {
    return class extends Base implements ZKLocusAdopter<{ latitude: numberType | ZKLongitude, longitude: numberType | ZKLongitude }, {latitude: ZKLatitude, longitude: ZKLongitude, factor: ZKNumber}, GeoPoint> {
        
        rawValue(): { latitude: numberType | ZKLatitude, longitude: numberType | ZKLongitude } {
            return this.asRawValue;
        }

        normalizedValue(): { latitude: ZKLatitude, longitude: ZKLongitude, factor: ZKNumber} {
            const factorAsNumber: number = 10 ** this.latitude.num_decimals;
            const factor: ZKNumber = new ZKNumber(factorAsNumber);
            const latitude: ZKLatitude = new ZKLatitude(this.latitude.normalized);
            const longitude: ZKLongitude = new ZKLongitude(this.longitude.normalized);
            return {
                latitude,
                longitude,
                factor,
            };
        }

        toZKValue(): GeoPoint {
            const scaledLatitude = this.latitude.normalized * Math.pow(10, 7);
            const scaledLongitude = this.longitude.normalized * Math.pow(10, 7);

            return new GeoPoint({
                latitude: Int64.from(scaledLatitude),
                longitude: Int64.from(scaledLongitude),
                factor: Int64.from(this.latitude.num_decimals)
            });
        }
    };
}



function ZKNumberToInt64Adopter<T extends new (...args: any[]) => { raw: numberType, normalized: number }>(Base: T) {
    return class extends Base implements ZKLocusAdopter<numberType, number, Int64> {

        /*
            Returns the raw value of the number. This is the value that the user provided.
        */
        rawValue(): numberType {
            return this.raw;
        }
    /*
         Returns the normalized value of the number. This is the value that will be used in the zkSNARK.
    */
        normalizedValue(): number {
            return this.normalized;
        }

        toZKValue(): Int64 {
            // Assuming Int64 is a valid type or class in the provided zkLocus code
            return Int64.from(this.normalizedValue());
        }
    };
}

/*
Represents a number that will be converted to the Fields of a zkSNARK in zkLocus.
*/
@ZKNumberToInt64Adopter
export class ZKNumber {
    protected _raw_value: numberType;
    protected _normalized_value: number;
    protected _num_decimals: number;

    constructor(value: numberType) {
        this._raw_value = value;
        this._normalized_value = Math.round(Number(value));
        this._num_decimals = this._count_num_decimals();
    }

    get raw(): numberType {
        return this._raw_value;
    }

    get normalized(): number {
        return this._normalized_value;
    }

    /*
    Returns the number of decimals in the number.
    */
    get num_decimals(): number {
        return this._num_decimals;
    }

    protected _count_num_decimals(): number {
        const decimalPart = this._normalized_value.toString().split('.')[1];
        return decimalPart ? decimalPart.length : 0;
    }
}

// Declaration merging to augment the ZKNumber class with the additional properties and methods of the ZKInterface
export interface ZKNumber extends ZKLocusAdopter<numberType, number, Int64> {}


/*
 Represents a coordinate that will be converted to the Fields of a zkSNARK in zkLocus.

    It imposes the maximum and the minimum possible values for a coordinate, wether it's latitude or longitude, and
    ensures that the precision limit is not exceeded.
*/
export class ZKCoordinate extends ZKNumber {
    constructor(value: numberType) {
        super(value);
        const valueAsInteger = Math.abs(Number(value));
        if (valueAsInteger > 180 || this.num_decimals > 7) {
            throw new Error("Invalid coordinate value");
        }
    }

    /*
        Returns the factor of the coordinate. This is the factor that the coordinate will be multiplied by
        to get the zkLocus value. The factor is a power of 10, and it's equal to 10 ^ num_decimals.

        For numbers without decimals (i.e. integers), the factor is 1.
    */
    get factor(): number {
        return Math.max(1, 10 ** this.num_decimals);
    }
}

/*
Represents a latitude that will be converted to the Fields of a zkSNARK in zkLocus.
*/
export class ZKLatitude extends ZKCoordinate {
    constructor(value: numberType) {
        super(value);
        const valueAsInteger = Math.abs(Number(value));
        if (valueAsInteger > 90) {
            throw new Error("Invalid latitude value");
        }
    }
}

/*
    Represents a longitude that will be converted to the Fields of a zkSNARK in zkLocus.
*/
export class ZKLongitude extends ZKCoordinate {

    constructor(value: numberType) {
        super(value);
        const valueAsInteger: number = Math.abs(Number(value));
        if (valueAsInteger > 180) {
            throw new Error("Invalid longitude value");
        }
    }
}

/*
    Represents a geographical point in TypeScript that will be converted into a zkLocus geographical point.
    A zkLocus geographical point is one that can be used in a zero-knowledge circuit. zkLocus uses O1JS to
    implement zero-knowledge circuits, so a zkLocus geographical point is one that is represented in a
    valid set of O1JS structures.

    All of the zero-knowledge functionality is also avaialbe on this class, namely:

    1. Proving wether a point is in polygon
    2. Proving the exact location.
*/
@ZKGeoPointToGeoPointAdopter
export class ZKGeoPoint {
    protected _latitude: ZKLatitude;
    protected _longitude: ZKLongitude;
    protected _rawValue: { latitude: numberType | ZKLatitude, longitude: numberType | ZKLongitude};

    constructor(latitude: numberType | ZKLatitude, longitude: numberType | ZKLongitude) {
        this._rawValue = { 
            latitude: latitude,
            longitude: longitude,
        };

        this._latitude = latitude instanceof ZKLatitude ? latitude : new ZKLatitude(latitude);
        this._longitude = longitude instanceof ZKLongitude ? longitude : new ZKLongitude(longitude);
    }

    get latitude(): ZKLatitude {
        return this._latitude;
    }

    get longitude(): ZKLongitude {
        return this._longitude;
    }

    get asRawValue(): { latitude: numberType | ZKLatitude, longitude: numberType | ZKLongitude } {
        return this._rawValue;
    }

    async proveInPolygon(polygon: ZKThreePointPolygon): Promise<ZKLocusProof> {
        // TODO: Implement
        return new ZKLocusProof(/* parameters */);
    }
}

// Declaration merging to augment the ZKGeoPoint class with the additional properties and methods of the ZKInterface
export interface ZKGeoPoint extends ZKLocusAdopter<{ latitude: numberType | ZKLatitude, longitude: numberType | ZKLongitude }, {latitude: ZKLatitude, longitude: ZKLongitude, factor: ZKNumber}, GeoPoint> {}



function ZKThreePointPolygonToThreePointPolygonAdopter<T extends new (...args: any[]) => ZKThreePointPolygon>(Base: T) {
    return class extends Base implements ZKLocusAdopter<[ZKGeoPoint, ZKGeoPoint, ZKGeoPoint], [GeoPoint, GeoPoint, GeoPoint], ThreePointPolygon> {
        rawValue(): [ZKGeoPoint, ZKGeoPoint, ZKGeoPoint] {
            return this.vertices;
        }

        normalizedValue(): [GeoPoint, GeoPoint, GeoPoint] {
            return [
                this.vertices[0].toZKValue(),
                this.vertices[1].toZKValue(),
                this.vertices[2].toZKValue()
            ];
        }

        toZKValue(): ThreePointPolygon {
            const vertices = this.vertices.map(vertex => vertex.toZKValue());
            const threePointPolygon = new ThreePointPolygon({
                vertice1: vertices[0],
                vertice2: vertices[1],
                vertice3: vertices[2]
            });

            // Assuming that ThreePointPolygon's constructor handles the struct creation and validation
            return threePointPolygon;
        }
    };
}

/*
Interface for the ThreePointPolygon zkLocus class. It represents a three point polygon, also refered to as a "geogrpahical area".
*/
@ZKThreePointPolygonToThreePointPolygonAdopter
export class ZKThreePointPolygon {
    private _vertices: [ZKGeoPoint, ZKGeoPoint, ZKGeoPoint];

    get vertices(): [ZKGeoPoint, ZKGeoPoint, ZKGeoPoint] {
        return this._vertices;
    }

    constructor(vertex1: ZKGeoPoint | RawCoordinates, vertex2: ZKGeoPoint | RawCoordinates, vertex3: ZKGeoPoint | RawCoordinates) {
        this._vertices = [
            vertex1 instanceof ZKGeoPoint ? vertex1 : new ZKGeoPoint(new ZKLatitude(vertex1.latitude), new ZKLongitude(vertex1.longitude)),
            vertex2 instanceof ZKGeoPoint ? vertex2 : new ZKGeoPoint(new ZKLatitude(vertex2.latitude), new ZKLongitude(vertex2.longitude)),
            vertex3 instanceof ZKGeoPoint ? vertex3 : new ZKGeoPoint(new ZKLatitude(vertex3.latitude), new ZKLongitude(vertex3.longitude))
        ];
        this._ensure_same_factor_in_vertices();
    }

    protected _ensure_same_factor_in_vertices(): void {
        const first_factor: number = this._vertices[0].latitude.num_decimals;
        for (let i = 1; i < this._vertices.length; i++) {
            if (this._vertices[i].latitude.num_decimals !== first_factor) {
                throw new Error("Invalid polygon vertices");
            }
        }
    }

}
