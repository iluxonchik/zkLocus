# zkLocus Release Changelog

## [0.4.0] - 2024-01-09

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

### Fixed
- Resolved circular dependency issues in `ZKPublicKey.ts` and `ZKGeoPointToGeoPointAdopter.ts`.

### Maintenance
- `.npmignore` file updated to reflect the current project structure.
- Added `zkLocus` whitepaper PDF in the docs.
