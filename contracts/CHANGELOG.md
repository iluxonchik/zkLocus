# zkLocus Release Changelog

## [0.4.0] - 2024-01-010

### Added
- `ZKGeoPointInPolygon.ts`, `ZKExactGeolocationMetadataCircuitCompiler.ts`, `IZKGeoPointProver.ts` for extending the geolocation proofing capabilities.
- Implemented inside-outside polygon commitment circuit in `GeoPointInOrOutOfPolygon.ts` and `GeoPointInOrOutOfPolygonCircuit.ts`. Its public API is not yet exposed. More extensive testing, alongside a public API interface.
- Introduced `ZKExactGeolocationMetadataCircuitProof` interface for attaching metadata to exact GeoPoint proofs.
- New base integration tests for metadata attachment in exact geolocation.
- SHA3-512 implementation compatible with O1JS and Zero-Knowledge circuits in `SHA3.ts`.
- Tests for SHA3 representation in Zero-Knowledge circuits and commitments.

### Changed
- Refactored API, solving circular imports and cleaning up dependencies in multiple files.
- Updated various sections, finalized the first iteration, and improved the whitepaper.
- Enhanced `ZKLocusProof` with circuit compilation and caching, extended to handle dependencies.
- Upgraded O1JS library to version 0.15.2.
- Integration tests updated to reflect the API changes.
- Refactored tests for correctness and improved comparisons in BasePointInPolygonTests.test.ts and various integration tests.
- Refactored Methods.ts to include type annotations and hide log statements for cleaner code.
- Corrected conversion logic in `ZKGeoPointToGeoPointAdopter.ts` and related modules for more accurate geopoint handling.
- Improvements to the stability, completeness, and semanthics of the automated test suites.

### Fixed
- Resolved circular dependency issues in `ZKPublicKey.ts` and `ZKGeoPointToGeoPointAdopter.ts`.
- Addressed issues in `GeoPoint` and `ZKGeoPoint` conversion logic, ensuring correct handling and adaptation.

### Maintenance
- `.npmignore` file updated to reflect the current project structure.
- Added `zkLocus` whitepaper PDF in the docs.
- Introduced `decimal.js` dependency for precise decimal handling.


## [0.5.0] - 2024-02-23

### Added
- Mina blockchain integration: Smart contracts added for the Mina blockchain, facilitating the integration with zkLocus proofs for geolocation verification.
- UI integration with Auro wallet for improved user experience and security.
- New Web App demo showcasing the integration with the oracle, metadata handling, and the generation of zkLocus proofs authenticated by the integration oracle. This demo allows users to associate metadata with their geolocation proofs.
- Reorganization and modularization of ZK O1JS circuits and related code to enhance maintainability and code structure.
- Prototype for attaching timestamps to GeoPoint in Polygon proofs to demonstrate feasibility. This is not intended for production use yet and is marked as a prototype to showcase feasibility.
- Numerous additions and corrections in the API and smart contracts to enhance zkLocus' functionality. This includes updates to ZKGeoPoint, ZKNumber, and ZKThreePointPolygon models to handle new types of data and improve the precision of geographical calculations.
- New interfaces and classes for handling proofs, including the introduction of rolled-up ZKGeoPointInPolygonCircuit proofs and enhancements to ZKGeoPointInPolygon proofs to support complex operations like AND combinations of proofs.


### Changed
- Major updates in API and smart contracts to support new functionalities and address previous limitations, enhancing the platform's efficiency and user experience.
- Refactoring of numerical handling within the system, focusing on normalization and scaling of ZKNumber values for improved accuracy in zero-knowledge proofs.
- Enhancements in the proof generation and verification processes, including updates to the API models such as ZKGeoPoint, ZKNumber, and ZKThreePointPolygon to accommodate new types of data and operations.
- Major refactoring and improvements in the handling of numbers within the system, especially regarding the normalization and scaling of ZKNumber values. This reflects a deeper understanding and more refined approach to dealing with numerical data within zero-knowledge proofs.
- Updates to the API models, including changes to the structure and methods of ZKGeoPoint, ZKNumber, and ZKThreePointPolygon to support new functionalities and improve the system's robustness
- Enhancements to the proof systems, including the addition of cloneable proofs and updates to the proof interfaces to support a wider range of functionalities. This aims to make zkLocus API more versatile and applicable to various use cases.

### Fixed
- Resolved issues with geo-spatial data handling and verification within the proofs to ensure accuracy and reliability.
- Addressed middleware caching and proof handling issues to ensure correct proof verification and improved system performance.
- Fixed prover implementation errors, ensuring correct generation and management of proofs for various types of geo-spatial data.