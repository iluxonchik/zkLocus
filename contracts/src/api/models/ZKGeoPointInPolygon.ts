import { Field, Int64 } from "o1js";
import { InputNumber } from "../Types";
import { GeoPoint } from "../../model/Geography";
import { ZKLocusAdopter } from "../adopters/Interfaces";
import ZKGeoPointToGeoPointAdopter from "../adopters/ZKGeoPointToGeoPointAdopter";
import { IZKGeoPointProver } from "../provers/IZKGeoPointProver";
import ZKGeoPointProver from "../provers/ZKGeoPointProver";
import { ZKNumber } from "./ZKNumber";
import { ZKLatitude } from "./ZKLatitude";
import { ZKLongitude } from "./ZKLongitude";
import { ZKThreePointPolygon } from "./ZKThreePointPolygon";


export class ZKGeoPointInPolygon {
    protected _polygons: ZKThreePointPolygon[];


}