import {
  CoordinatesInPolygon,
  GeographicalPoint,
  NoncedGeographicalPoint,
  ThreePointPolygon,
} from './Polygon.js';

import { Field, Mina, PrivateKey, AccountUpdate, §Int64 } from 'o1js';

console.log('o1js loaded');
const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

console.log('Preparing integers...');
const uint1: Int64 = Int64.from(4567369283283521);
const uint2: Int64 = Int64.from(4567567318665665);
console.log('Performing subtraction...');
const uint3: Int64 = uint1.sub(uint2);
console.log('Operation: 4567369283283521 - 4567567318665665');
console.log('a: ', uint1.toString());
console.log('b: ', uint2.toString());
console.log('a - b: ', uint3.toString());

const uint4: Int64 = Int64.from(1);
const uint5: Int64 = Int64.from(2);
const uint6: Int64 = uint4.div(uint5);
const uint7: Int64 = uint6.mul(uint5);
console.log('Operation: 1 / 2 * 2');
console.log('1 / 2 = ' + uint6.toString());
console.log('1 / 2 * 2 = ' + uint7.toString());

// Compile the ZKApp
console.log('Compiling ZKApp...');
await CoordinatesInPolygon.compile();
console.log('\tZKApp compiled successfully ✅');

// Setup Coordinates and Polygon
// 1. Coordinates with small latitude value

let brasovCenterCoordinates1 = new NoncedGeographicalPoint({
  point: new GeographicalPoint({
    latitude: Int64.from(4565267451004980),
    longitude: Int64.from(2561045985607537),
    factor: Int64.from(10n ** 14n),
  }),
  nonce: Field(Math.floor(Math.random() * 1000000)),
});

let notBrasovCenterCoordinates1 = new NoncedGeographicalPoint({
  point: new GeographicalPoint({
    latitude: Int64.from(4573351807726547),
    longitude: Int64.from(2563860336947891),
    factor: Int64.from(10n ** 14n),
  }),
  nonce: Field(Math.floor(Math.random() * 1000000)),
});

// 3. Define the polygons

// 3.1 Polygon in Center of Brasov
let brasovCenterPolygon = new ThreePointPolygon({
  vertice1: new GeographicalPoint({
    latitude: Int64.from(4567567318665665),
    longitude: Int64.from(2555484866751258),
    factor: Int64.from(10n ** 14n),
  }),
  vertice2: new GeographicalPoint({
    latitude: Int64.from(4561431116624503),
    longitude: Int64.from(2561711908131041),
    factor: Int64.from(10n ** 14n),
  }),
  vertice3: new GeographicalPoint({
    latitude: Int64.from(4567369283283521),
    longitude: Int64.from(2567497463146939),
    factor: Int64.from(10n ** 14n),
})
});

console.log('Proving that point in Brasov Center is inside of Brasov Center Polygon...');
const proofBrasovCenterCoordinatesInBrasovCenterPolygon =
  await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
    brasovCenterCoordinates1,
    brasovCenterPolygon
  );

console.log('Results:');
console.log('Proof Brasov Center Coordinates in Brasov Center Polygon:')
console.log(proofBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput.toString());

console.log('Proving that point NOT in Brasov Center is inside of Brasov Center Polygon...');
const proofNotBrasovCenterCoordinatesInBrasovCenterPolygon = 
    await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
        notBrasovCenterCoordinates1,
        brasovCenterPolygon
    );


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
