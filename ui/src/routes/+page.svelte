<script lang="ts">
	import MapComponent from '../components/MapComponent.svelte';
	import LocationInput from '../components/LocationInput.svelte';
	import ProofGeneration from '../components/ProofGeneration.svelte';
	import LocateMe from '../components/LocateMe.svelte';
	import PolygonPointsDisplay from '../components/PolygonPointsDisplay.svelte';
	import CompilationProgress from '../components/CompilationProgress.svelte';

	import {
		GeoPointProviderCircuit,
		GeoPointInPolygonCircuit
	} from '../../../contracts/src/zkprogram/private/Geography';
	import { GeoPoint, ThreePointPolygon } from '../../../contracts/src/model/Geography';
	import { Empty, Int64, Proof, type JsonProof } from 'o1js';
	import { GeoPointInPolygonCommitment } from '../../../contracts/src/model/private/Commitment';
	import StatusDisplay from '../components/StatusDisplay.svelte';
	import ProofVerification from '../components/ProofVerification.svelte';

	type LatLng = {
		lat: number;
		lng: number;
	};

	let MAX_DECIMAL_FACTOR: number = 7;

	let appStatus: string = 'Waiting...';

	let latitude = (45.65136267101511).toFixed(MAX_DECIMAL_FACTOR); // Default latitude
	let longitude = (25.612004326029343).toFixed(MAX_DECIMAL_FACTOR); // Default longitude
	let polygonPoints: LatLng[] = [];
	let proofGenerated = false;
	let geoPointProviderCircuitVerificatoinKey: string;
	let geoPointInPolygonCircuitVerificationKey: string;

	let geoPointForProof: GeoPoint;
	let polygonForProof: ThreePointPolygon;

	let compilationInProgress = false;
	let compilationStatus = {
		geoPointProviderCompiled: false,
		geoPointInPolygonCompiled: false,
		geoPointProviderIsCompiling: false,
		geoPointInPolygonIsCompiling: false
	};

	async function compileProofs() {
		compilationInProgress = true;
		try {
			console.log('Compiling GeoPointProviderCircuit... ⚙️');
			appStatus = 'Compiling GeoPointProviderCircuit...';

			compilationStatus = { ...compilationStatus, geoPointProviderIsCompiling: true };
			let { verificationKey } = await GeoPointProviderCircuit.compile();
			geoPointProviderCircuitVerificatoinKey = verificationKey;
			compilationStatus = {
				...compilationStatus,
				geoPointProviderCompiled: true,
				geoPointInPolygonIsCompiling: true
			};

			console.log('\tCompilation complete ✅');

			console.log('Compiling GeoPointInPolygonCircuit... ⚙️');
			appStatus = 'Compiling GeoPointProviderCircuit...';

			({ verificationKey } = await GeoPointInPolygonCircuit.compile());
			geoPointInPolygonCircuitVerificationKey = verificationKey;

			compilationStatus = { ...compilationStatus, geoPointInPolygonCompiled: true };

			console.log('\tCompilation complete ✅');
		} catch (error) {
			console.error('Error during compilation:', error);
		} finally {
			compilationInProgress = false;
		}
	}

	function geoPointFromLatitudeLongitude(
		latitudeStr: string,
		longitudeStr: string,
		factorDecimals: number = MAX_DECIMAL_FACTOR
	): GeoPoint {
		// latitude and longitude are strings with X decimals, let's convert them back to `number`, set decimals to `factorDecimals` and convert them to `Int64`
		if (factorDecimals < 0) throw new Error('factorDecimals must be an integer betwee 0 and 7');
		if (factorDecimals > MAX_DECIMAL_FACTOR)
			throw new Error('7 is the maximum precision currenly supported by zkLocus');

		let parsedLatitude: string = parseFloat(latitudeStr).toFixed(factorDecimals);
		let parsedLongitude: string = parseFloat(longitudeStr).toFixed(factorDecimals);

		let latitudeNumber: number = Math.floor(parseFloat(parsedLatitude) * 10 ** factorDecimals);
		let longitudeNumber: number = Math.floor(parseFloat(parsedLongitude) * 10 ** factorDecimals);
		let latitudeArg: Int64 = Int64.from(latitudeNumber);
		let longitudeArg: Int64 = Int64.from(longitudeNumber);
		let factorArg: Int64 = Int64.from(10 ** factorDecimals);

		return new GeoPoint({ latitude: latitudeArg, longitude: longitudeArg, factor: factorArg });
	}

	function threePointPolygonFromPoints(
		points: Array<LatLng>,
		factorDecimals: number = 7
	): ThreePointPolygon {
		if (points.length !== 3) throw new Error('A polygon must have exactly 3 points');
		let pointsArg: GeoPoint[] = points.map((point) =>
			geoPointFromLatitudeLongitude(
				point.lat.toFixed(factorDecimals),
				point.lng.toFixed(factorDecimals),
				factorDecimals
			)
		);
		return new ThreePointPolygon({
			vertice1: pointsArg[0],
			vertice2: pointsArg[1],
			vertice3: pointsArg[2]
		});
	}

	async function generateProof() {
		appStatus = 'Generating proof... ⚙️';
		let geoPoint: GeoPoint = geoPointFromLatitudeLongitude(latitude, longitude, 7);
		let polygon: ThreePointPolygon = threePointPolygonFromPoints(polygonPoints, 7);

		let geoPointInPolygonProof: Proof<Empty, GeoPointInPolygonCommitment> =
			await GeoPointInPolygonCircuit.proveGeoPointIn3PointPolygon(geoPoint, polygon);
		let proofInJson: JsonProof = geoPointInPolygonProof.toJSON();

		appStatus = 'Proof generated ✅';

		proofGenerated = true;
		return {
			proof: proofInJson,
			polygon: polygon,
			geoPointProviderCircuitVerificatoinKey: geoPointProviderCircuitVerificatoinKey,
			geoPointInPolygonCircuitVerificationKey: geoPointInPolygonCircuitVerificationKey
		};
	}

	function setPolygonPoints(newPoints: Array<LatLng>) {
		polygonPoints = newPoints.map((point) => ({
			lat: point.lat,
			lng: point.lng
		}));
	}

	export function locateUser() {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(function (position) {
				let latitudeRaw = position.coords.latitude;
				let longitudeRaw = position.coords.longitude;
				latitude = latitudeRaw.toFixed(MAX_DECIMAL_FACTOR);
				longitude = longitudeRaw.toFixed(MAX_DECIMAL_FACTOR);
			});
		} else {
			console.error('Geolocation is not available.');
		}
	}

	function handleUpdateCoords(event) {
		latitude = event.detail.latitude;
		longitude = event.detail.longitude;
	}

	$: canGenerateProof =
		!compilationInProgress &&
		compilationStatus.geoPointProviderCompiled &&
		compilationStatus.geoPointInPolygonCompiled &&
		latitude !== undefined &&
		longitude !== undefined &&
		polygonPoints.length === 3;

	// Call locateUser on component mount or based on some user action
</script>

<StatusDisplay status={appStatus} />
<LocationInput bind:latitude bind:longitude />
<MapComponent
	{latitude}
	{longitude}
	{setPolygonPoints}
	{proofGenerated}
	on:updateCoords={handleUpdateCoords}
/>
<LocateMe handler={locateUser} />
<PolygonPointsDisplay points={polygonPoints} />
<ProofGeneration {generateProof} {canGenerateProof} />
<button on:click={compileProofs} disabled={compilationInProgress || canGenerateProof}
	>Compile Proofs</button
>
<CompilationProgress status={compilationStatus} />

<ProofVerification />
