import {
  CoordinatesInPolygon,
  GeographicalPoint,
  ThreePointPolygon,
} from './Polygon.js';

import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';

console.log('o1js loaded');
const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

// Compilete the ZKApp
await CoordinatesInPolygon.compile();

// Setup Coordinates and Polygon
// 1. Mocked coordinates, whose lat and lon sum to below 100
let notInPolygonCoordsMocked = new GeographicalPoint({
  latitude: Field(10),
  longitude: Field(10),
});

// 2. Mocked coordinates, whose lat and lon sum to above 100
let inPolygonCoordsMocked = new GeographicalPoint({
  latitude: Field(100),
  longitude: Field(100),
});

// 3. Polygon: For the mock, any Polygon is okay
let mockedPolygon = new ThreePointPolygon({
  vertice1: new GeographicalPoint({ latitude: Field(1), longitude: Field(1) }),
  vertice2: new GeographicalPoint({ latitude: Field(2), longitude: Field(2) }),
  vertice3: new GeographicalPoint({ latitude: Field(3), longitude: Field(3) }),
});

const proofNotInPolygon =
  await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
    notInPolygonCoordsMocked,
    mockedPolygon
  );
const proofInPolygon =
  await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
    inPolygonCoordsMocked,
    mockedPolygon
  );

const notInPolygonPublicOutput = proofNotInPolygon.publicOutput;
const inPolygonPublicOutput = proofInPolygon.publicOutput;

console.log('notInPolygonPublicOutput', notInPolygonPublicOutput);
console.log('inPolygonPublicOutput', inPolygonPublicOutput);
