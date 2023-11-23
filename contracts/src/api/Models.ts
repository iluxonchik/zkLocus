import { Int64 } from "o1js";
import { GeoPoint } from "../model/Geography";

// Utility Types
type numberType = number | string; // Represents the number type

// Named Tuple Equivalent in TypeScript
interface RawCoordinates {
    latitude: numberType;
    longitude: numberType;
}

function ZKGeoPointToGeoPointInterface<T extends new (...args: any[]) => ZKGeoPoint>(Base: T) {
    return class extends Base {
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

    get raw_value(): numberType {
        return this._raw_value;
    }

    get normalized_value(): number {
        return this._normalized_value;
    }

    get num_decimals(): number {
        return this._num_decimals;
    }

    protected _count_num_decimals(): number {
        const decimalPart = this._normalized_value.toString().split('.')[1];
        return decimalPart ? decimalPart.length : 0;
    }
}

class ZKCoordinate extends ZKNumber {
    constructor(value: numberType) {
        super(value);
        const valueAsInteger = Math.abs(Number(value));
        if (valueAsInteger > 180 || this.num_decimals > 7) {
            throw new Error("Invalid coordinate value");
        }
    }
}

class ZKLatitude extends ZKCoordinate {
    constructor(value: numberType) {
        super(value);
        const valueAsInteger = Math.abs(Number(value));
        if (valueAsInteger > 90) {
            throw new Error("Invalid latitude value");
        }
    }
}

class ZKLongitude extends ZKCoordinate {}

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

}

class ZKThreePointPolygon {
    private _vertices: [ZKGeoPoint, ZKGeoPoint, ZKGeoPoint];

    constructor(vertex1: ZKGeoPoint, vertex2: ZKGeoPoint, vertex3: ZKGeoPoint) {
        this._vertices = [vertex1, vertex2, vertex3];
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
