<script lang="ts">
	import MapComponent from '../../components/MapComponent.svelte';
	import LocateMe from '../../components/LocateMe.svelte';
	import AuroWalletConnectorExact from '../../components/AuroWalletConnectorExact.svelte';
	import StatusDisplay from '../../components/StatusDisplay.svelte';
	import ProofVerification from '../../components/ProofVerification.svelte';

	import { Decimal } from 'decimal.js';

	import OracleClient from 'zkLocus/src/tests/utils/OracleClient';
	import { onMount } from 'svelte';
	import {ZKExactGeoPointCircuitProof, ZKPublicKey, ZKSignature, ZKGeoPoint, ZKThreePointPolygon, ZKExactGeolocationMetadataCircuitProof, GeoPointWithMetadataContract} from 'zklocus';
	import ProofVerificationExact from '../../components/ProofVerificationExact.svelte';
	
	type LatLng = {
		lat: number;
		lng: number;
	};

	let MAX_DECIMAL_FACTOR: number = 7;

	let appStatus: string = 'Waiting...';

	const DEFAULT_LATITUDE: number = 45.65136267101511;
	const DEFAULT_LONGITUDE: number = 25.612004326029343;

	let latitude: number = normalizeNumber(DEFAULT_LATITUDE); // Default latitude
	let longitude: number = normalizeNumber(DEFAULT_LONGITUDE); // Default longitude
	let polygonPoints: LatLng[] = [];
	let proofGenerated = false;

	let compilationInProgress = false;
	let compilationStatus = {
		isGeoPointInPolygonCompiled: false
	};

	let isProofGenerationAllowed: boolean = false;

	let allPolygons = [];

	let allThreePointPolygons: ZKThreePointPolygon[] = [];
	let zkGeoPoint: ZKGeoPoint = new ZKGeoPoint(latitude, longitude);

	let finalZKProof: ZKExactGeolocationMetadataCircuitProof;

	let oracleEndpointURL: string = 'http://127.0.0.1:5577';
	let connectionStatus: boolean | null = null;
	let isGeolocationAuthenticated: boolean = false;

	let metadata: string;


	onMount(async () => {
		// if (typeof window.mina !== 'undefined') {
  		// 	console.log('Auro Wallet is installed!');
			
		// 	const account:string[]|ProviderError = await window.mina.requestAccounts()
    	// 		.catch((err: any) => err);
		// }


	});

	async function testConnection() {
		try {
			console.log('Testing connection to Integration Oracle at ', oracleEndpointURL, ' ...')
			const oracleClient = new OracleClient(oracleEndpointURL);
			const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(latitude, longitude);

			const zkSignature = new ZKSignature(signature);
			const zkPublicKey = new ZKPublicKey(publicKey);
			
			console.log('\tSignature: ', zkSignature.toBase58());
			console.log('\tPublic Key: ', zkPublicKey.toBase58());
			console.log('Connection to Integration Oracle Successful! ✅');

			const geoStr = JSON.stringify(zkGeoPoint);
			console.log('zkGeoPoint: ', geoStr);
			const geoPoint = JSON.parse(geoStr);
			console.log('geoPoint: ', geoPoint);
	
			connectionStatus = true;
		} catch (error) {
			console.log('Error during oracle connection test:', error);
			connectionStatus = false;
		}
	}

	async function authenticateGeolocation() {
		try {
			console.log('Authenticating geolocation with Integration Oracle at ', oracleEndpointURL, ' ...')
			const oracleClient = new OracleClient(oracleEndpointURL);
			const { signature, publicKey } = await oracleClient.fetchSignatureAndPublicKey(latitude, longitude);

			const zkSignature = new ZKSignature(signature);
			const zkPublicKey = new ZKPublicKey(publicKey);

			await zkGeoPoint.Prove.authenticateFromIntegrationOracle(zkPublicKey, zkSignature);
			isGeolocationAuthenticated = true;
			console.log('Geolocation authenticated! Latitude: ', zkGeoPoint.latitude.toString(), ' Longitude: ', zkGeoPoint.longitude.toString());

		} catch (error) {
			console.log('Error during oracle connection test:', error);
		}
	}



	$: if (latitude !== undefined && longitude !== undefined && !isGeolocationAuthenticated) {
		zkGeoPoint = new ZKGeoPoint(latitude, longitude);
	}

	function normalizeNumber(number: number): number {
		const decimal: Decimal = new Decimal(number);
		const fixedDecimal = decimal.toDecimalPlaces(MAX_DECIMAL_FACTOR);
		return fixedDecimal.toNumber();
	}

	function leafletPolygonToThreePointPolygon(polygon: LatLng[]): ZKThreePointPolygon {
		let normalizedPolygon = polygon.map((point) => ({
			lat: normalizeNumber(point.lat),
			lng: normalizeNumber(point.lng)
		}));

		const zkPolygon: ZKThreePointPolygon = new ZKThreePointPolygon(
			{ latitude: normalizedPolygon[0].lat, longitude: normalizedPolygon[0].lng },
			{ latitude: normalizedPolygon[1].lat, longitude: normalizedPolygon[1].lng },
			{ latitude: normalizedPolygon[2].lat, longitude: normalizedPolygon[2].lng }
		);
		console.log(zkPolygon.toString());
		return zkPolygon;
	}

	function handlePolygonsChange(event) {
		allPolygons = event.detail.polygons;
		allThreePointPolygons = allPolygons.map(leafletPolygonToThreePointPolygon);
	}

	async function compileProofs() {
		compilationInProgress = true;
		try {

			console.log('Compiling ZKLocus Circuiuts... ⚙️');
			appStatus = 'Compiling ZKLocus Circuits...';

			const startTime = Date.now();


			await ZKExactGeoPointCircuitProof.compile();
			await ZKExactGeolocationMetadataCircuitProof.compile();
			await GeoPointWithMetadataContract.compile();

			const endTime = Date.now();
			const durationInSeconds = (endTime - startTime) / 1000;
			const minutes = Math.floor(durationInSeconds / 60);
			const seconds = Math.floor(durationInSeconds % 60);

			compilationStatus = { isGeoPointInPolygonCompiled: true };
			isProofGenerationAllowed = true;
			appStatus = 'Compiled ✅';
			console.log(`\tCompilation complete ✅. It took ${minutes} minutes and ${seconds} seconds.`);
		} catch (error) {
			console.error('Error during compilation:', error);
		} finally {
			compilationInProgress = false;
		}
	}


	async function generateProof() {
		appStatus = 'Proving... ⚙️';

		console.log('Attaching metadata to exact GeoPoint proof...');
		
		finalZKProof = await zkGeoPoint.Prove.attachMetadata(metadata);

		console.log('Metadata attached! ✅');

		

		appStatus = 'Proofs generated ✅';
		proofGenerated = true;
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
				let latitudeRaw: number = position.coords.latitude;
				let longitudeRaw: number = position.coords.longitude;
				latitude = normalizeNumber(latitudeRaw);
				longitude = normalizeNumber(longitudeRaw);
			});
		} else {
			console.error('Geolocation is not available.');
		}
	}

	function handleUpdateCoords(event) {
		latitude = normalizeNumber(event.detail.latitude);
		longitude = normalizeNumber(event.detail.longitude);
	}


	function handleWalletConnected(event) {
    console.log('Wallet connected:', event.detail.account);
	}

  function handleTransactionSubmitted(event) {
    console.log('Transaction submitted:', event.detail.hash);
  }


</script>

<div class="container mx-auto p-4">
	<!-- Header and Status Display -->
	<div class="navbar mb-2 shadow-lg bg-neutral text-neutral-content">
		<div class="flex-1 px-2 mx-2">
			<span class="text-lg font-bold">zkLocus - Geolocation For Web3</span>
		</div>
		<div class="flex-none">
			<StatusDisplay status={appStatus} />
		</div>
	</div>

	<div class="card lg:card-side bg-base-100 shadow-xl mb-4">
		<div class="card-body">

			<div class="form-control">
				<label class="label">
					<span class="label-text">Oracle Endpoint URL:</span>
				</label>
				<input
					type="text"
					placeholder="Enter Oracle Endpoint URL"
					class="input input-bordered"
					bind:value={oracleEndpointURL}
				/>
				<button class="btn btn-primary" on:click={testConnection}>Test Connection</button>
            {#if connectionStatus !== null}
                <div class={connectionStatus ? 'text-success' : 'text-error'}>
                    {connectionStatus ? 'Connection successful' : 'Connection failed'}
                </div>
            {/if}
			</div>

			<MapComponent
				{latitude}
				{longitude}
				{setPolygonPoints}
				{proofGenerated}
				on:polygonsChange={handlePolygonsChange}
				on:updateCoords={handleUpdateCoords}
				mapId="gen-map"
			/>
			<h2 class="card-title">Proof Generation</h2>
			<div class="form-control">
				<label class="label">
					<span class="label-text">Latitude:</span>
				</label>
				<input
					type="text"
					placeholder="Latitude"
					class="input input-bordered"
					bind:value={latitude}
					disabled={isGeolocationAuthenticated}
				/>
				<label class="label">
					<span class="label-text">Longitude:</span>
				</label>
				<input
					type="text"
					placeholder="Longitude"
					class="input input-bordered"
					bind:value={longitude}
					disabled={isGeolocationAuthenticated}
				/>
				<label class="label">
					<span class="label-text">Metadata:</span>
				</label>
				<input
					type="text"
					placeholder="Enter your metadata here after authenticating your geolocation"
					class="input input-bordered"
					bind:value={metadata}
					disabled={!isGeolocationAuthenticated}
				/>
			</div>
			<div class="card-actions justify-start">
				<button
					class="btn btn-secondary"
					on:click={async (e) => {
						await compileProofs();
					}}
					disabled={compilationInProgress || isProofGenerationAllowed}>Compile Proofs</button
				>
				<LocateMe handler={locateUser} isDisabled={isGeolocationAuthenticated}/>

				<button class="btn btn-primary" on:click={async (e) => {
						await authenticateGeolocation();
					}}
					disabled={isGeolocationAuthenticated || !isProofGenerationAllowed}>Authenticate Geolocation</button>

				<button
					class="btn btn-primary"
					on:click={async (e) => {
						await generateProof();
					}}
					disabled={!isProofGenerationAllowed || !isGeolocationAuthenticated}>Attach Metadata</button
				>
			</div>
		</div>
	</div>
	<div>
		{#if finalZKProof}
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
				<textarea readonly>{JSON.stringify(finalZKProof, null, 2)}</textarea>
			</div>
		{/if}
	</div>

	<div class="my-4">
		<h2 class="text-xl font-bold mb-2">Submit Proof with Auro Wallet</h2>
		<AuroWalletConnectorExact proof={finalZKProof} on:walletConnected={handleWalletConnected} on:transactionSubmitted={handleTransactionSubmitted} />
	</div>
	

	<div class="divider">OR</div>

	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Proof Verification</h2>
			<ProofVerificationExact zkProof={finalZKProof} />
		</div>
	</div>

	<!-- <div class="p-4">
		<CompilationProgress status={compilationStatus} />
	</div> -->
</div>
