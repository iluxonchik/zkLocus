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

	let proof: str;

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
			console.log('\tCompilation complete ✅');
			appStatus = 'All compilations complete ✅';
			
			geoPointInPolygonCircuitVerificationKey = verificationKey;

			compilationStatus = { ...compilationStatus, geoPointInPolygonCompiled: true };

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
		proof = {
			proof: proofInJson,
			polygon: polygon,
			geoPointProviderCircuitVerificatoinKey: geoPointProviderCircuitVerificatoinKey,
			geoPointInPolygonCircuitVerificationKey: geoPointInPolygonCircuitVerificationKey
		};
		return proof;
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

<div class="container mx-auto p-4">

<!-- Header and Status Display -->
<div class="navbar mb-2 shadow-lg bg-neutral text-neutral-content">
  <div class="flex-1 px-2 mx-2">
    <span class="text-lg font-bold">zkLocus - Privacy-Preserving GeoLocation</span>
  </div>
  <div class="flex-none">
    <StatusDisplay status={appStatus} />
  </div>
</div>

<div class="card lg:card-side bg-base-100 shadow-xl mb-4">
  <div class="card-body">
<MapComponent
	{latitude}
	{longitude}
	{setPolygonPoints}
	{proofGenerated}
	on:updateCoords={handleUpdateCoords}
	mapId="gen-map"
/>
    <h2 class="card-title">Proof Generation</h2>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Latitude:</span>
      </label>
      <input type="text" placeholder="Latitude" class="input input-bordered" bind:value={latitude} />
      <label class="label">
        <span class="label-text">Longitude:</span>
      </label>
      <input type="text" placeholder="Longitude" class="input input-bordered" bind:value={longitude} />
    </div>
    <div class="card-actions justify-start">
      <LocateMe handler={locateUser} />
      <button class="btn btn-primary" on:click={async (e) => {await generateProof()}} disabled={!canGenerateProof}>Generate Proof</button>
      <button class="btn btn-secondary" on:click={async (e) => {await compileProofs()}} disabled={compilationInProgress || canGenerateProof}>Compile Proofs</button>
    </div>
  </div>
  <MapComponent {latitude} {longitude} {setPolygonPoints} {proofGenerated} on:updateCoords={handleUpdateCoords} /> 
</div>
<div>
{#if proof}
    <style>
        textarea {
            width: 100%;
            height: 300px;
            font-family: monospace;
            white-space: pre;
            overflow: auto;
        }
    </style>
	<div class="card-actions">
			
    <h2 class="card-title">Generated Proof:</h2>
    <textarea readonly>{JSON.stringify(proof, null, 2)}</textarea>

	</div>
  {/if}
</div>

<PolygonPointsDisplay points={polygonPoints} />

<div class="divider">OR</div>


<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Proof Verification</h2>
    <ProofVerification />
  </div>
</div>


<div class="p-4">
<CompilationProgress status={compilationStatus} />
</div>

</div>