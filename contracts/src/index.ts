// import { GeoPointInPolygon } from './zkprogram/private/Geography.js';
// import {
//   GeoPoint,
//   ThreePointPolygon
// } from './model/Geography.js';
// import { GeoPoint } from './model/Geography.js';

// import { Field, Mina, PrivateKey, AccountUpdate, Int64 } from 'o1js';

// console.log('o1js loaded');
// const useProof = false;
// const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
// Mina.setActiveInstance(Local);
// const { privateKey: deployerKey, publicKey: deployerAccount } =
//   Local.testAccounts[0];
// const { privateKey: senderKey, publicKey: senderAccount } =
//   Local.testAccounts[1];

// console.log('Preparing integers...');
// const uint1: Int64 = Int64.from(-5);
// const uint2: Int64 = Int64.from(5);
// console.log('Performing multiplication...');
// const uint3: Int64 = uint1.mul(uint2);
// console.log('Operation: -5 * 5');
// console.log('a: ', uint1.magnitude.toString(), ' ', uint1.sgn.toString(), ' ', uint1.toString());
// console.log('b: ', uint2.toString(), ' ', uint2.sgn.toString(), ' ', uint2.toString());
// console.log('a * b: ', uint3.toString(), ' ', uint3.sgn.toString(), ' ', uint3.toString());

// const uint4: Int64 = Int64.from(1);
// const uint5: Int64 = Int64.from(2);
// const uint6: Int64 = uint4.div(uint5);
// const uint7: Int64 = uint6.mul(uint5);
// console.log('Operation: 1 / 2 * 2');
// console.log('1 / 2 = ' + uint6.toString());
// console.log('1 / 2 * 2 = ' + uint7.toString());

// class InternalStructuresInterface {

//   static countDecimals(value: number): number {
//       if (!isFinite(value)) return 0; // Handle Infinity and NaN

//       let text = value.toString();
//       // Check if the number is in exponential form
//       if (text.indexOf('e-') > -1) {
//           const parts = text.split('e-');
//           const e = parseInt(parts[1], 10);
//           return e; // The number of decimal places is equal to the exponent in this case
//       }
//       // Normal decimal number
//       if (text.indexOf('.') > -1) {
//           return text.split('.')[1].length;
//       }

//       return 0; // No decimal point means 0 decimal places
//   }

//   static noncedGeographicalPointFromNumber(latitude: number, longitude: number): GeoPoint {
//       const num_digits_after_decimal_in_logitude: number = InternalStructuresInterface.countDecimals(longitude);
//       const num_digits_after_decimal_in_latitude: number = InternalStructuresInterface.countDecimals(latitude);

//       const larger_value: number = Math.max(num_digits_after_decimal_in_latitude, num_digits_after_decimal_in_logitude);

//       if (larger_value > 8) {
//           throw new Error('Number of digits after decimal in longitude and latitude must be less than 8');
//       }

//       const normalizedLatitude: number = latitude * (10 ** larger_value);
//       const normalizedLongitude: number = longitude * (10 ** larger_value);
//       const factor: number = 10 ** larger_value;

//       return new GeoPoint({
//           point: new GeoPoint({
//               latitude: Int64.from(normalizedLatitude),
//               longitude: Int64.from(normalizedLongitude),
//               factor: Int64.from(factor),
//           }),
//           nonce: Field(Math.floor(Math.random() * 1000000)),
//       });
//   }
// }

// debugger;
// // Compile the ZKApp
// console.log('Compiling ZKApp...');
// await GeoPointInPolygon.compile();
// console.log('\tZKApp compiled successfully ✅');

// // Setup Coordinates and Polygon
// // 1. Coordinates with small latitude value

// let brasovCenterCoordinates1 = new GeoPoint({
//   point: new GeoPoint({
//     latitude: Int64.from(4565267),
//     longitude: Int64.from(2561046),
//     factor: Int64.from(10n ** 5n),
//   }),
//   nonce: Field(Math.floor(Math.random() * 1000000)),
// });

// let notBrasovCenterCoordinates1 = new GeoPoint({
//   point: new GeoPoint({
//     latitude: Int64.from(4573351),
//     longitude: Int64.from(2563860),
//     factor: Int64.from(10n ** 5n),
//   }),
//   nonce: Field(Math.floor(Math.random() * 1000000)),
// });

// // 3. Define the polygons

// // 3.1 Polygon in Center of Brasov
// let brasovCenterPolygon = new ThreePointPolygon({
//   vertice1: new GeoPoint({
//     latitude: Int64.from(4567567),
//     longitude: Int64.from(2555484),
//     factor: Int64.from(10n ** 5n),
//   }),
//   vertice2: new GeoPoint({
//     latitude: Int64.from(4561431),
//     longitude: Int64.from(2561711),
//     factor: Int64.from(10n ** 5n),
//   }),
//   vertice3: new GeoPoint({
//     latitude: Int64.from(4567369),
//     longitude: Int64.from(2567497),
//     factor: Int64.from(10n ** 5n),
// })
// });

// // NOTE: manually verified the coordintes for this example on maps
// console.log('###### Proving that point in Brasov Center is inside of Brasov Center Polygon... ######');
// const proofBrasovCenterCoordinatesInBrasovCenterPolygon =
//   await GeoPointInPolygon.proveCoordinatesIn3PointPolygon(
//     brasovCenterCoordinates1,
//     brasovCenterPolygon
//   );
//   console.log('\tProving Coordinates in Polygon successful ✅');

// console.log('\tResults:');
// console.log('\tProof Brasov Center Coordinates in Brasov Center Polygon:')
// console.log('\t', proofBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput.toString());

// console.log('#####Proving that point NOT in Brasov Center is inside of Brasov Center Polygon...');
// const proofNotBrasovCenterCoordinatesInBrasovCenterPolygon = 
//     await GeoPointInPolygon.proveCoordinatesIn3PointPolygon(
//         notBrasovCenterCoordinates1,
//         brasovCenterPolygon
//     );
  
//   console.log('\tResults:');
//   console.log('\tProof NOT Brasov Center Coordinates are not inside Brasov Center Polygon:')
//   console.log('\t', proofBrasovCenterCoordinatesInBrasovCenterPolygon.publicOutput.toString());

// // console.log('Proving small coordinates not in medium polygon...');
// // const proofSmallCoordinatesNotInMediumPolygon =
// //   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
// //     smallLatitudeCoords,
// //     mockedPolygonMediumVertice
// //   );

// // console.log('Proving small coordinates in large polygon...');
// // const proofSmallCoordinatesInLargePolygon =
// //   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
// //     smallLatitudeCoords,
// //     mockedPolygonLargeVertice
// //   );

// // console.log('Proving large coordintes in small polygon...');
// // const proofLargeCoordinatesInSmallPolygon =
// //   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
// //     largeLatitudeCoords,
// //     mockedPolygonSmallVertice
// //   );

// // console.log('Proving large coordintes in medium polygon...');
// // const proofLargeCoordinatesInMediumPolygon =
// //   await CoordinatesInPolygon.proveCoordinatesIn3PointPolygon(
// //     largeLatitudeCoords,
// //     mockedPolygonMediumVertice
// //   );

// // const notInPolygonPublicOutput: string =
// //   proofSmallCoordinatesNotInSmallPolygon.publicOutput.toString();
// // const inPolygonPublicOutput: string =
// //   proofLargeCoordinatesInSmallPolygon.publicOutput.toString();

// // console.log(
// //   '1️⃣ Not In Polygon Coordinates Output:\n',
// //   notInPolygonPublicOutput
// // );
// // console.log('2️⃣ In Polygon Coordinates Output:\n', inPolygonPublicOutput);

// // // 4. Do OR operation on a set of proofs

// // // 4.1 ORing the two proofs that should yield an in-polygon result
// // console.log('ORing the two proofs that should yield an in-polygon result...');
// // const orProof1 = await CoordinatesInPolygon.OR(
// //   proofSmallCoordinatesNotInSmallPolygon,
// //   proofSmallCoordinatesInLargePolygon
// // );
// // console.log('\tORing the two proofs successful ✅');

// // const orProofPublicOutput: string = orProof1.publicOutput.toString();
// // console.log('3️⃣ OR Proof Output:\n', orProofPublicOutput);

// // // 4.2 ORing the two proofs that should yield a not in-polygon result
// // console.log(
// //   'ORing the two proofs that should yield a not in-polygon result...'
// // );
// // console.log('Proving Coordinates in Polygon...');
// // const orProof2 = await CoordinatesInPolygon.OR(
// //   proofSmallCoordinatesNotInSmallPolygon,
// //   proofSmallCoordinatesNotInMediumPolygon
// // );
// // console.log('\tORing the two proofs successful ✅');

// // const orProof2PublicOutput: string = orProof2.publicOutput.toString();
// // console.log('4️⃣ OR Proof Output:\n', orProof2PublicOutput);

// // // 5. Do AND operation on a set of proofs

// // // 4.1 ANDing the two proofs that should yield an in-polygon result
// // console.log('ANDing the two proofs that should yield an in-polygon result...');
// // const andProof1 = await CoordinatesInPolygon.AND(
// //   proofLargeCoordinatesInMediumPolygon,
// //   proofLargeCoordinatesInSmallPolygon
// // );
// // console.log('\tANDing the two proofs successful ✅');

// // const andProofPublicOutput: string = andProof1.publicOutput.toString();
// // console.log('5️⃣ AND Proof Output:\n', andProofPublicOutput);

// // // 4.2 ANDing the two proofs that should yield a not in-polygon result
// // console.log(
// //   'ANDing the two proofs that should yield a not in-polygon result...'
// // );
// // const andProof2 = await CoordinatesInPolygon.AND(
// //   proofSmallCoordinatesNotInSmallPolygon,
// //   proofSmallCoordinatesInLargePolygon
// // );
// // console.log('\tANDing the two proofs successful ✅');

// // const andProof2PublicOutput: string = andProof2.publicOutput.toString();
// // console.log('6️⃣ AND Proof Output:\n', andProof2PublicOutput);
