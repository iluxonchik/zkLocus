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
type numberType = number | string; // Represents the number type

// Named Tuple Equivalent in TypeScript
interface RawCoordinates {
    latitude: numberType;
    longitude: numberType;
}


/*
    This is the parent abstraction class for all zkLocus proofs. Any zkLocus proof is interpertable and abstractble by
    this type. It can load and convert proofs to JSON, combine proofs together, and verify them.

    Internally, it uses the zkLocus API to perform the operations. It also contains properties based on the
    proof structure.
*/
class ZKLocusProof {
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


/*
    Concrete implementation of ZKInterface that converts ZKNumbers into Int64.
*/
function ZKGeoPointToGeoPointInterface<T extends new (...args: any[]) => ZKGeoPoint>(Base: T) {
    return class extends Base {
        /*
            Converts value from TypeScript's ZkLocusGeoPoint, into O1JS GeoPoint. It uses the properties of the ZkLocusGeoPoint
            to perform the conversion into O1JS GeoPoint.
        */
        to_zkValue(): GeoPoint {
            const latitude: ZKLatitude = this.latitude;
            const longitude: ZKLongitude = this.longitude;
            const factor: number = this.latitude.num_decimals;


            const scaledLatitude = latitude.normalized_value * Math.pow(10, 7);
            const scaledLongitude = longitude.normalized_value * Math.pow(10, 7);
            return new GeoPoint({
                latitude: Int64.from(scaledLatitude),
                longitude: Int64.from(scaledLongitude),
                factor: Int64.from(factor),
            });
        }
    };
}


function ZKNumberToInt64Interface<T extends new (...args: any[]) => ZKNumber>(Base: T) {
    return class extends Base {
        to_zkValue(): Int64 {
            // Assuming Int64 is a valid type or class in the provided zkLocus code
            // Convert the normalized number value to an Int64 zkLocus value
            return Int64.from(Math.round(this.normalized_value));
        }
    };
}


/*
Represents a number that will be converted to the Fields of a zkSNARK in zkLocus.
*/
@ZKNumberToInt64Interface
class ZKNumber {
    protected _raw_value: numberType;
    protected _normalized_value: number;
    protected _num_decimals: number;

    constructor(value: numberType) {
        this._raw_value = value;
        this._normalized_value = Number(value);
        this._num_decimals = this._count_num_decimals();
    }

    /*
        Returns the raw value of the number. This is the value that the user provided.
    */
    get raw_value(): numberType {
        return this._raw_value;
    }
    /*
         Returns the normalized value of the number. This is the value that will be used in the zkSNARK.
    */
    get normalized_value(): number {
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

/*
 Represents a coordinate that will be converted to the Fields of a zkSNARK in zkLocus.

    It imposes the maximum and the minimum possible values for a coordinate, wether it's latitude or longitude, and
    ensures that the precision limit is not exceeded.
*/
class ZKCoordinate extends ZKNumber {
    constructor(value: numberType) {
        super(value);
        const valueAsInteger = Math.abs(Number(value));
        if (valueAsInteger > 180 || this.num_decimals > 7) {
            throw new Error("Invalid coordinate value");
        }
    }
}

/*
Represents a latitude that will be converted to the Fields of a zkSNARK in zkLocus.
*/
class ZKLatitude extends ZKCoordinate {
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
class ZKLongitude extends ZKCoordinate {

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
@ZKGeoPointToGeoPointInterface
class ZKGeoPoint {
    private _latitude: ZKLatitude;
    private _longitude: ZKLongitude;

    constructor(latitude: ZKLatitude, longitude: ZKLongitude) {
        this._latitude = latitude;
        this._longitude = longitude;
    }

    get latitude(): ZKLatitude {
        return this._latitude;
    }

    get longitude(): ZKLongitude {
        return this._longitude;
    }

    async proveInPolygon(polygon: ZKThreePointPolygon): Promise<ZKLocusProof> {
        // TODO: implement
        return new ZKLocusProof(/* parameters */);
    }

}


/*
Interface for the ThreePointPolygon zkLocus class. It represents a three point polygon, also refered to as a "geogrpahical area".
*/
class ZKThreePointPolygon {
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
