import {
  CoordinatesInPolygon,
  GeographicalPoint,
  NoncedGeographicalPoint,
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

// Compile the ZKApp
console.log('Compiling ZKApp...');
await CoordinatesInPolygon.compile();
console.log('\tZKApp compiled successfully ✅');

// Setup Coordinates and Polygon
// 1. Coordinates with small latitude value
let bucharestCoordinates = new NoncedGeographicalPoint({
  point: new GeographicalPoint({
    latitude: Field(10n**12n),
    longitude: Field(10n**12n),
    percision: Field(12n),
  }),
  nonce: Field(Math.floor(Math.random() * 1000000)),
});

// 2. Coordinates with large latitude value
let largeLatitudeCoords = new NoncedGeographicalPoint({
  point: new GeographicalPoint({
    latitude: Field(100),
    longitude: Field(100),
    percision: Field(12),
  }),
  nonce: Field(Math.floor(Math.random() * 1000000)),
});

// 3. Define the polygons

// 3.1. Polygon with small latitude values.
let bucharestPolygon = new ThreePointPolygon({
  vertice1: new GeographicalPoint({ latitude: Field(44553067187003), longitude: Field(25922498632632), percision: Field(12) }),
  vertice2: new GeographicalPoint({ latitude: Field(44547026017312), longitude: Field(26.334702160865), percision: Field(12)}),
  vertice3: new GeographicalPoint({ latitude: Field(44318892330267), longitude: Field(26.087803903594), percision: Field(12)}),
});

// 3.2 Polygon with medium latitude values.
let mockedPolygonMediumVertice = new ThreePointPolygon({
  vertice1: new GeographicalPoint({ latitude: Field(50), longitude: Field(1), percision: Field(12) }),
  vertice2: new GeographicalPoint({ latitude: Field(50), longitude: Field(2), percision: Field(12) }),
  vertice3: new GeographicalPoint({ latitude: Field(50), longitude: Field(3), percision: Field(12) }),
});

// 3.2. Polygon with large latitude values.
let mockedPolygonLargeVertice = new ThreePointPolygon({
  vertice1: new GeographicalPoint({
    latitude: Field(100),
    longitude: Field(1),
    percision. Field(12),
  }),
  vertice2: new GeographicalPoint({
    latitude: Field(200),
    longitude: Field(2),
    percision: Field(12),
  }),
  vertice3: new GeographicalPoint({
    latitude: Field(300),
    longitude: Field(3),
    percision: Field(12),
  }),
});

console.log('Proving small coordinates not in small polygon...');
const proofBucharestCoordinatesInBucharest =
  await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
    bucharestCoordinates,
    bucharestPolygon,
  );

  console.log('Results:')
  console.log(proofBucharestCoordinatesInBucharest.publicOutput.toString());

// console.log('Proving small coordinates not in medium polygon...');
// const proofSmallCoordinatesNotInMediumPolygon =
//   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
//     smallLatitudeCoords,
//     mockedPolygonMediumVertice
//   );

// console.log('Proving small coordinates in large polygon...');
// const proofSmallCoordinatesInLargePolygon =
//   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
//     smallLatitudeCoords,
//     mockedPolygonLargeVertice
//   );

// console.log('Proving large coordintes in small polygon...');
// const proofLargeCoordinatesInSmallPolygon =
//   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
//     largeLatitudeCoords,
//     mockedPolygonSmallVertice
//   );

// console.log('Proving large coordintes in medium polygon...');
// const proofLargeCoordinatesInMediumPolygon =
//   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
//     largeLatitudeCoords,
//     mockedPolygonMediumVertice
//   );

// const notInPolygonPublicOutput: string =
//   proofSmallCoordinatesNotInSmallPolygon.publicOutput.toString();
// const inPolygonPublicOutput: string =
//   proofLargeCoordinatesInSmallPolygon.publicOutput.toString();

// console.log(
//   '1️⃣ Not In Polygon Coordinates Output:\n',
//   notInPolygonPublicOutput
// );
// console.log('2️⃣ In Polygon Coordinates Output:\n', inPolygonPublicOutput);

// // 4. Do OR operation on a set of proofs

// // 4.1 ORing the two proofs that should yield an in-polygon result
// console.log('ORing the two proofs that should yield an in-polygon result...');
// const orProof1 = await CoordinatesInPolygon.OR(
//   proofSmallCoordinatesNotInSmallPolygon,
//   proofSmallCoordinatesInLargePolygon
// );
// console.log('\tORing the two proofs successful ✅');

// const orProofPublicOutput: string = orProof1.publicOutput.toString();
// console.log('3️⃣ OR Proof Output:\n', orProofPublicOutput);

// // 4.2 ORing the two proofs that should yield a not in-polygon result
// console.log(
//   'ORing the two proofs that should yield a not in-polygon result...'
// );
// console.log('Proving Coordinates in Polygon...');
// const orProof2 = await CoordinatesInPolygon.OR(
//   proofSmallCoordinatesNotInSmallPolygon,
//   proofSmallCoordinatesNotInMediumPolygon
// );
// console.log('\tORing the two proofs successful ✅');

// const orProof2PublicOutput: string = orProof2.publicOutput.toString();
// console.log('4️⃣ OR Proof Output:\n', orProof2PublicOutput);

// // 5. Do AND operation on a set of proofs

// // 4.1 ANDing the two proofs that should yield an in-polygon result
// console.log('ANDing the two proofs that should yield an in-polygon result...');
// const andProof1 = await CoordinatesInPolygon.AND(
//   proofLargeCoordinatesInMediumPolygon,
//   proofLargeCoordinatesInSmallPolygon
// );
// console.log('\tANDing the two proofs successful ✅');

// const andProofPublicOutput: string = andProof1.publicOutput.toString();
// console.log('5️⃣ AND Proof Output:\n', andProofPublicOutput);

// // 4.2 ANDing the two proofs that should yield a not in-polygon result
// console.log(
//   'ANDing the two proofs that should yield a not in-polygon result...'
// );
// const andProof2 = await CoordinatesInPolygon.AND(
//   proofSmallCoordinatesNotInSmallPolygon,
//   proofSmallCoordinatesInLargePolygon
// );
// console.log('\tANDing the two proofs successful ✅');

// const andProof2PublicOutput: string = andProof2.publicOutput.toString();
// console.log('6️⃣ AND Proof Output:\n', andProof2PublicOutput);
