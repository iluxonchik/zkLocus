import { Field, Int64, Poseidon, PrivateKey, PublicKey, Signature } from "o1js";
import { RawCoordinates, InputNumber } from "./Types";

import { GeoPoint, ThreePointPolygon } from "../model/Geography";
import ZKThreePointPolygonToThreePointPolygonAdopter from "./adopters/ZKThreePointPolygonToThreePointPolygonAdopter";
import ZKNumberToInt64Adopter from "./adopters/ZKNumberToInt64Adopter";
import { ZKLocusAdopter } from "./adopters/Interfaces";
import ZKGeoPointToGeoPointAdopter from "./adopters/ZKGeoPointToGeoPointAdopter";
import ZKGeoPointProver, { IZKGeoPointProver } from "./provers/ZKGeoPointProver";
import ZKPublicKeyToPublicKeyAdopter from "./adopters/ZKPublicKeyToPublicKeyAdopter";
import ZKPrivateKeyToPrivateKeyAdopter from "./adopters/ZKPrivateKeyToPrivateKeyAdopter";
import ZKSignatureToSignatureAdopter from "./adopters/ZKSignatureToSignatureAdopter";


/*
Represents a number that will be converted to the Fields of a zkSNARK in zkLocus.
*/
@ZKNumberToInt64Adopter
export class ZKNumber {
    protected _raw_value: InputNumber;
    protected _normalized_value: number;
    protected _num_decimals: number;

    constructor(value: InputNumber) {
        this._raw_value = value;
        this._normalized_value = Number(value);
        this._num_decimals = this.countNumDecimals();
    }

    get raw(): InputNumber {
        return this._raw_value;
    }

    get normalized(): number {
        return this._normalized_value;
    }

    get scaled(): number {
        return Math.round(this._normalized_value * Math.pow(10, this._num_decimals));
    }

    /*
        Returns the factor of the coordinate. This is the factor that the coordinate will be multiplied by
        to get the zkLocus value. The factor is a power of 10, and it's equal to 10 ^ num_decimals.

        For numbers without decimals (i.e. integers), the factor is 1.
    */
    get factor(): number {
        return Math.max(1, 10 ** this._num_decimals);
    }

    protected countNumDecimals(): number {
        const decimalPart = this._normalized_value.toString().split('.')[1];
        return decimalPart ? decimalPart.length : 0;
    }
}
// Declaration merging to augment the ZKNumber class with the additional properties and methods of the ZKInterface
export interface ZKNumber extends ZKLocusAdopter<InputNumber, number, Int64> { }

/*
 Represents a coordinate that will be converted to the Fields of a zkSNARK in zkLocus.

    It imposes the maximum and the minimum possible values for a coordinate, wether it's latitude or longitude, and
    ensures that the precision limit is not exceeded.
*/

export class ZKCoordinate extends ZKNumber {
    MAX_FACTOR: number = 10 ** 7;
    constructor(value: InputNumber) {
        super(value);
        if (this.factor > this.MAX_FACTOR) {
            throw new Error(`Invalid factor. The maximum factor is 7. The provided value is ${this.factor}`);
        }
    } 
}
/*
Represents a latitude that will be converted to the Fields of a zkSNARK in zkLocus.
*/

export class ZKLatitude extends ZKCoordinate {
    constructor(value: InputNumber) {
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

    constructor(value: InputNumber) {
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

@ZKGeoPointProver
@ZKGeoPointToGeoPointAdopter
export class ZKGeoPoint {
    protected _latitude: ZKLatitude;
    protected _longitude: ZKLongitude;
    protected _rawValue: { latitude: InputNumber | ZKLatitude; longitude: InputNumber | ZKLongitude; };

    constructor(latitude: InputNumber | ZKLatitude, longitude: InputNumber | ZKLongitude) {
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

    get asRawValue(): { latitude: InputNumber | ZKLatitude; longitude: InputNumber | ZKLongitude; } {
        return this._rawValue;
    }

    /*
    * Create a ZKGeoPoint from a GeoPoint.
    */
    static fromGeoPoint(geoPoint: GeoPoint): ZKGeoPoint {
        const latitude: Int64 = geoPoint.latitude;
        const longitude: Int64 = geoPoint.longitude;
        const factor: Int64 = geoPoint.factor;

        const longitudeAsBigInt: BigInt = longitude.toField().toBigInt();
        const latitudeAsBigInt: BigInt = latitude.toField().toBigInt();
        const factorAsBigInt: BigInt = factor.toField().toBigInt();

        const latitudeAsNumber: number = Number(latitudeAsBigInt);
        const longitudeAsNumber: number = Number(longitudeAsBigInt);
        const factorAsNumber: number = Number(factorAsBigInt);

        const latitudeDecimal: number = latitudeAsNumber / factorAsNumber;
        const longitudeDecimal: number = longitudeAsNumber / factorAsNumber;

        return new ZKGeoPoint(latitudeDecimal, longitudeDecimal);
    }

    /*
    * Obtain the GeoPoint representation of this ZKGeoPoint.
    */
    toGeoPoint(): GeoPoint {
        return this.toZKValue();
    }

    hash(): Field {
        return this.toZKValue().hash();
    }

}
// Declaration merging to augment the ZKGeoPoint class with the additional properties and methods of the ZKInterface
export interface ZKGeoPoint extends ZKLocusAdopter<{ latitude: InputNumber | ZKLatitude; longitude: InputNumber | ZKLongitude; }, { latitude: ZKLatitude; longitude: ZKLongitude; factor: ZKNumber; }, GeoPoint>, IZKGeoPointProver { }

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
        const first_factor: number = this._vertices[0].latitude.factor;
        for (let i = 1; i < this._vertices.length; i++) {
            if (this._vertices[i].latitude.factor !== first_factor) {
                throw new Error("Invalid polygon vertices");
            }
        }
    }

}

export interface ZKThreePointPolygon extends ZKLocusAdopter<[ZKGeoPoint, ZKGeoPoint, ZKGeoPoint], [GeoPoint, GeoPoint, GeoPoint], ThreePointPolygon> { }

export class ZKKeyPair<T extends PrivateKey | PublicKey> {
    protected key: T;

    hash(): Field {
        const keyAsFields: Field[] = this.key.toFields();
        return Poseidon.hash(keyAsFields);
    }

    toBase58(): string {
        return this.key.toBase58();
    }
}

@ZKPublicKeyToPublicKeyAdopter
export class ZKPublicKey extends ZKKeyPair<PublicKey> {
    protected _raw: PublicKey | string;
    

    constructor(publicKeyOrBase58: PublicKey | string) {
        super();
        if (typeof publicKeyOrBase58 === "string") {
            this.key = PublicKey.fromBase58(publicKeyOrBase58);
        } else {
            this.key = publicKeyOrBase58;
        }
        this._raw = publicKeyOrBase58;
    }

    hash(): Field {
        const pubKeyAsFields: Field[] = this.key.toFields();
        return Poseidon.hash(pubKeyAsFields);
    }

    get raw(): PublicKey | string {
        return this._raw;
    }

    get normalized(): PublicKey {
        return this.key;
    }

    verifyPrivateKey(zkPrivateKey: ZKPrivateKey): boolean {
        return this.key.toBase58() === zkPrivateKey.toPublicKey().toBase58();
    }

}

// Declaration merging for ZKPublicKey with the adopter's methods
export interface ZKPublicKey extends ZKLocusAdopter<PublicKey, PublicKey, PublicKey> { }


@ZKPrivateKeyToPrivateKeyAdopter
export class ZKPrivateKey extends ZKKeyPair<PrivateKey> {
    protected _raw: PrivateKey | string;

    constructor(privateKeyOrBase58: PrivateKey | string) {
        super();
        if (typeof privateKeyOrBase58 === "string") {
            this.key = PrivateKey.fromBase58(privateKeyOrBase58);
        } else {
            this.key = privateKeyOrBase58;
        }
        this._raw = privateKeyOrBase58;
    }

    get raw(): PrivateKey | string {
        return this._raw;
    }

    get normalized(): PrivateKey {
        return this.key;
    } 
    
    /**
     * Derives the associated public key.
     * @returns a {@link ZKPublicKey}.
     */
    toPublicKey(): ZKPublicKey {
        return new ZKPublicKey(this.key.toPublicKey());
    }

    verifyPublicKey(zkPublicKey: ZKPublicKey): boolean {
        return this.key.toPublicKey().toBase58() === zkPublicKey.toBase58();
    }
}

// Declaration merging for ZKPrivateKey with the adopter's methods
export interface ZKPrivateKey extends ZKLocusAdopter<PrivateKey | string, PrivateKey, PrivateKey> { }


@ZKSignatureToSignatureAdopter
export class ZKSignature {
    protected signature: Signature;
    protected _raw: Signature | string;

    constructor(signatureOrBase58: Signature | string) {
        if (typeof signatureOrBase58 === "string") {
            this.signature = Signature.fromBase58(signatureOrBase58);
        } else {
            this.signature = signatureOrBase58;
        }
        this._raw = signatureOrBase58;
    }

    get raw(): Signature | string {
        return this._raw;
    }

    get normalized(): Signature {
        return this.signature;
    }

    toBase58(): string {
        return this.signature.toBase58();
    }

    verify(publicKey: PublicKey, msg: Field[]): boolean {
        return this.signature.verify(publicKey, msg).toBoolean();
    }
}

// Declaration merging for ZKSignature with the adopter's methods
export interface ZKSignature extends ZKLocusAdopter<Signature | string, Signature, Signature> { }