# zkLocus 🌍🔒

![zkLocus Logo](https://raw.githubusercontent.com/iluxonchik/blog/main/public/assets/blog/zklocus/zklocus-geolocation-for-web3.png)

[![NPM Version](https://img.shields.io/npm/v/zklocus.svg)](https://www.npmjs.com/package/zklocus)
[![Build Status](https://img.shields.io/travis/zkLocus/zklocus.svg)](https://travis-ci.org/zkLocus/zklocus)
[![License](https://img.shields.io/npm/l/zklocus.svg)](https://github.com/iluxonchik/zkLocus/blob/main/contracts/LICENSE)

zkLocus is an application, a framework, and protocol that enables private and programmable geolocation sharing both off-chain and on-chain. Natively implemented on the Mina Protocol using the O1JS framework, zkLocus turns geolocation into a Real-World-Asset (RWA). 🌍💻




## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Generating Geolocation Proofs](#generating-geolocation-proofs)
    - [Creating ZKGeoPoint Instances](#creating-zkgeopoint-instances)
    - [Generating Proofs for Polygons](#generating-proofs-for-polygons)
    - [Generating Proofs for Multiple Polygons](#generating-proofs-for-multiple-polygons)
  - [Verifying Geolocation Proofs](#verifying-geolocation-proofs)
  - [Attaching Metadata to Geolocation Proofs](#attaching-metadata-to-geolocation-proofs)
  - [Combining Geolocation Proofs](#combining-geolocation-proofs)
    - [AND Combination](#and-combination)
    - [OR Combination](#or-combination)
  - [Authenticating Geolocation with Integration Oracle](#authenticating-geolocation-with-integration-oracle)
  - [Generating Exact Geolocation Proofs](#generating-exact-geolocation-proofs)
  - [Combining Point-in-Polygon Proofs](#combining-point-in-polygon-proofs)
- [API Reference](#api-reference)
  - [ZKGeoPoint](#zkgeopoint)
  - [ZKThreePointPolygon](#zkthreepointpolygon)
  - [ZKGeoPointInPolygonProof](#zkgeopointinpolygonproof)
  - [ZKGeoPointInOrOutOfPolygonCircuitProof](#zkgeopointinoroutofpolygoncircuitproof)
  - [ZKExactGeoPointCircuitProof](#zkexactgeopointcircuitproof)
  - [ZKExactGeolocationMetadataCircuitProof](#zkexactgeolocationmetadatacircuitproof)
- [Testing](#testing)
- [Building](#building)
- [Contributing](#contributing)
- [License](#license)

## Overview

zkLocus leverages recursive zkSNARKs and Mina blockchain to enable a secure, private, and verifiable protocol for sharing geolocation data. It allows users to prove their presence within specific geographical regions without revealing their exact coordinates. With zkLocus, you can generate proofs for various geolocation scenarios, attach metadata to proofs, and combine and compress proofs. 🌐🔐

## zkLocus: Authenticated Private Geolocation Off & On-Chain

zkLocus is a Zero-Knowledge, on-chain, cross-chain, and off-chain protocol, enabling authenticated, private and verifiable geolocation sharing. It allows users to authenticate their presence in specific geographical areas without revealing exact coordinates. For example, a user can prove they are within the European Union without disclosing their precise location. Additionally, zkLocus provides the flexibility for users to share precise coordinates when desired, with the option for semi-private sharing with selected entities. It's also possible to veriably share exact geolocation on-chain, thus turning it into a Real-World-Asset(RWA). In Ethereum terms, it allows you to create a non-fungible token (NFT) / ERC-720 for geolocation data.

By bringing geolocation data onto the blockchain, zkLocus enables decentralized, verifiable, and transparent geolocation sharing. It offers native bridging capabilities, allowing for easy integration with any other blockchain such as Ethereum, Cardano and Polygon Miden, either through bridging or by direcly verifying zkLocus zkSNARK proofs on the target blockchain. Moreover, zkLocus supports native rollup functionality and infinite proof compression, thanks to its architecture based on recursive zkSNARKs.

## zkSafeZones: Blockchain & Zero-Knowledge for Civilian Protection in Conflict Zones

zkSafeZones is a solution that leverages zkLocus, the Mina Protocol, and recursive zkSNARKs to establish a system for safeguarding civilians in conflict areas. It introduces an economic model centered around the $ZKL token, incentivizing the submission of geolocation data and legal evidence. This fosters a self-sustainable, decentralized legal system for protecting civilians and ensuring compliance with international law.

By enabling private, verifiable geolocation sharing, zkSafeZones aims to enhance civilian protection and adherence to the International Humanitarian Law (IHL) principles, such as the principles of distinction, proportionality, and necessity.

## More Information 💡

You can find more information about zkLocus and zkSafeZones in the following resources:

- [📝 zkLocus Whitepaper](https://zklocus.dev/whitepaper)
- [⛑️ zkSafeZones Whitepaper](https://zklocus.dev/zkSafeZones)
- [📍 zkLocus Homepage](https://zklocus.dev/)

## Installation

To install zkLocus, run the following command:

```bash
npm install zklocus
```

## Usage

### Generating Geolocation Proofs

zkLocus provides a flexible and intuitive end-user API for generating geolocation proofs. This API abstracts away the Zero-Knowledge details and can be used with your JavaScript/TypeScript code. You can create proofs for a single polygon or multiple polygons, attach metadata to proofs, and combine proofs using logical operators.

#### Creating ZKGeoPoint Instances

To generate a geolocation proof, you first need to create a `ZKGeoPoint` instance representing the geographical point:

```typescript
import { ZKGeoPoint } from 'zklocus';

const latitude = 40.7128;
const longitude = -74.0060;
const zkGeoPoint = new ZKGeoPoint(latitude, longitude);
```

#### Generating Proofs for Polygons

Once you have a `ZKGeoPoint` instance, you can generate a proof for a specific polygon using the `inPolygon()` method:

```typescript
import { ZKThreePointPolygon } from 'zklocus';

const polygon = new ZKThreePointPolygon(
  { latitude: 40.7128, longitude: -74.0060 },
  { latitude: 40.7129, longitude: -74.0061 },
  { latitude: 40.7130, longitude: -74.0062 }
);

const proof = await zkGeoPoint.Prove.inPolygon(polygon);
```

#### Generating Proofs for Multiple Polygons

You can also generate proofs for multiple polygons simultaneously using the `inPolygons()` method:

```typescript
const polygons = [
  new ZKThreePointPolygon(...),
  new ZKThreePointPolygon(...),
  new ZKThreePointPolygon(...)
];

const proofs = await zkGeoPoint.Prove.inPolygons(polygons);
```

### Verifying Geolocation Proofs

To verify a geolocation proof, you can use the `verify()` method:

```typescript
proof.verify();
```

This method will throw an error if the proof is invalid.

### Attaching Metadata to Geolocation Proofs

zkLocus allows you to attach arbitrary metadata to geolocation proofs. You can use the `attachMetadata()` method to associate metadata with a proof:

```typescript
const metadata = "Hello, world!";
const proofWithMetadata = await zkGeoPoint.Prove.attachMetadata(metadata);
```

The attached metadata can be of any size and type, providing flexibility for various use cases.

### Combining Geolocation Proofs

zkLocus enables you to combine multiple geolocation proofs using logical operators such as `AND` and `OR`. This feature allows you to create more complex proofs that represent the combination of multiple conditions.

#### AND Combination

To combine proofs using the `AND` operator, you can use the `AND()` method:

```typescript
const combinedProof = await proof1.AND(proof2);
```

The resulting proof will be valid only if both `proof1` and `proof2` are valid.

#### OR Combination

To combine proofs using the `OR` operator, you can use the `OR()` method:

```typescript
const combinedProof = await proof1.OR(proof2);
```

The resulting proof will be valid if either `proof1` or `proof2` is valid.

### Authenticating Geolocation with Integration Oracle

zkLocus provides an [Integration Oracle](https://github.com/zkLocus/integration-oracle) that allows you to authenticate geolocation data using external sources. You can use the `authenticateFromIntegrationOracle()` method to create an authenticated geolocation proof:

```typescript
import { ZKPublicKey, ZKSignature } from 'zklocus';

const publicKey = new ZKPublicKey(...);
const signature = new ZKSignature(...);

const authenticatedProof = await zkGeoPoint.Prove.authenticateFromIntegrationOracle(publicKey, signature);
```

### Generating Exact Geolocation Proofs

In addition to generating proofs for polygons, zkLocus allows you to create proofs for exact geographical points. You can use the `exactGeoPoint()` method to generate an exact geolocation proof:

```typescript
const exactProof = await zkGeoPoint.Prove.exactGeoPoint();
```

### Combining Point-in-Polygon Proofs

zkLocus provides the `combinePointInPolygonProofs()` method to combine multiple point-in-polygon proofs into a single proof:

```typescript
const combinedProof = await zkGeoPoint.Prove.combinePointInPolygonProofs();
```

This method combines the proofs that the `ZKGeoPoint` is inside and outside of different polygons into a single proof.

## API Reference

### ZKGeoPoint

Represents a geographical point with latitude and longitude coordinates.

#### Constructor

```typescript
new ZKGeoPoint(latitude: number | ZKLatitude, longitude: number | ZKLongitude)
```

#### Methods

- `Prove.inPolygon(polygon: ZKThreePointPolygon): Promise<ZKGeoPointInPolygonProof>`
- `Prove.inPolygons(polygons: ZKThreePointPolygon[]): Promise<ZKGeoPointInPolygonProof[]>`
- `Prove.combineProofs(proofs: ZKGeoPointInPolygonProof[]): Promise<ZKGeoPointInPolygonProof>`
- `Prove.combinePointInPolygonProofs(): Promise<ZKGeoPointInOrOutOfPolygonCircuitProof>`
- `Prove.authenticateFromIntegrationOracle(publicKey: ZKPublicKey, signature: ZKSignature): Promise<ZKGeoPointProviderCircuitProof>`
- `Prove.exactGeoPoint(): Promise<ZKExactGeoPointCircuitProof>`
- `Prove.attachMetadata(metadata: string): Promise<ZKExactGeolocationMetadataCircuitProof>`

### ZKThreePointPolygon

Represents a polygon defined by three geographical points.

#### Constructor

```typescript
new ZKThreePointPolygon(
  vertex1: ZKGeoPoint | RawCoordinates,
  vertex2: ZKGeoPoint | RawCoordinates,
  vertex3: ZKGeoPoint | RawCoordinates
)
```

### ZKGeoPointInPolygonProof

Represents a proof that a ZKGeoPoint is inside a ZKThreePointPolygon.

#### Methods

- `verify(): void`
- `AND(other: ZKGeoPointInPolygonProof): Promise<ZKGeoPointInPolygonProof>`
- `OR(other: ZKGeoPointInPolygonProof): Promise<ZKGeoPointInPolygonProof>`

### ZKGeoPointInOrOutOfPolygonCircuitProof

Represents a proof that a ZKGeoPoint is inside or outside of a polygon.

#### Methods

- `verify(): void`

### ZKExactGeoPointCircuitProof

Represents a proof for an exact geographical point (GeoPoint) in a zero-knowledge circuit.

#### Methods

- `verify(): void`

### ZKExactGeolocationMetadataCircuitProof

Represents a proof of an exact GeoPoint with associated metadata.

#### Methods

- `verify(): void`

## $ZKL Token and DeFi Ecosystem

zkLocus introduces the $ZKL token, which serves as the foundation for a DeFi ecosystem built around the zkLocus platform. The $ZKL token enables various use cases and incentives within the zkLocus ecosystem, including:

- Fully Private Geolocation Sharing: Users can share their geolocation without exposing any personally identifiable information, such as their IP address or Mina address. By associating a bounty in $ZKL tokens with their geolocation proof, users can incentivize others to submit the proof on their behalf, ensuring privacy and anonymity.

- Outsourcing Proof Submission: $ZKL tokens allow users to outsource the submission of their geolocation proofs to others by attaching a bounty for the submission. This eliminates the need for users to maintain their own infrastructure, making zkLocus more accessible and user-friendly.

- Digital Evidence Collection: In the zkSafeZones proposal, $ZKL tokens play a crucial role in digital evidence collection. Bounties in $ZKL tokens can be associated with specific geolocation proofs, incentivizing users to collect and submit relevant evidence, even in offline scenarios.

The $ZKL token and its associated DeFi ecosystem enable a self-sustaining and decentralized economy within zkLocus, fostering participation, privacy, and accessibility.

## Offline Functionality

zkLocus is designed to operate seamlessly in offline environments. Users can generate geolocation proofs offline and later submit them to the blockchain when an internet connection becomes available. This offline capability ensures that zkLocus remains functional even in areas with limited or intermittent connectivity, making it suitable for a wide range of applications and scenarios. For a practical application of this consult the [⛑️ zkSafeZones Whitepaper](https://zklocus.dev/zkSafeZones).

## Metadata Association

zkLocus allows arbitrary metadata to be associated with geolocation proofs. This metadata can include commitments to any external data, such as documents, images, or even entire blockchains. By associating metadata with zkLocus proofs, users can create rich and context-specific geolocation attestations, enabling integration with various systems and applications.

## Off-Chain and Legacy System Integration

zkLocus proofs can be used off-chain and integrated with Web 2.0 and legacy systems. The `ZkProgram`s are a low-level abstraction over Zero-Knowledge circuits that enable the generation of raw zkSNARKs proofs, which can be loaded and verified in any environment. This allows zkLocus to be seamlessly integrated into existing infrastructures and applications, extending its utility beyond the blockchain ecosystem.

## Cross-Chain Integration

zkLocus is natively implemented on Mina Protocol blockchain, but can be integrated into any solution or blockchain, either through bridging or by using the raw zkSNARKs. We are currently working on porting zkLocus to expand its reach and interoperability. This cross-environment integration will enable zkLocus to be direcly used across a diverse range of decentralized applications and ecosystems.

## Testing

zkLocus comes with a comprehensive test suite to ensure the reliability and correctness of the library. To run the tests, use the following command:

```bash
npm run test
```

The test suite covers various scenarios, including generating proofs, verifying proofs, attaching metadata, combining proofs, and more.

## Building

To build the zkLocus project, run the following command:

```bash
npm run build
```

This command will compile the TypeScript source code into JavaScript and generate the necessary build artifacts.

## Contributing

We welcome contributions to zkLocus! If you'd like to contribute, please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with descriptive messages
4. Push your changes to your forked repository
5. Submit a pull request to the main zkLocus repository

Please ensure that your code follows the project's coding style and conventions. Also, make sure to write tests for your changes and ensure that all existing tests pass.

## License

zkLocus is released under the [Apache License 2.0](https://github.com/iluxonchik/zkLocus/blob/main/contracts/LICENSE)

## Contact

For any inquiries or collaboration opportunities, please reach out to us at:

- [📧 contact@zklocus.dev](mailto:contact@zklocus.dev)
- [🐤 Twitter/X](https://x.com/zkLocus)
- [📍 Homepage](https://zklocus.dev)