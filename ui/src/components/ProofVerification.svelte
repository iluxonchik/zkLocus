<script lang="ts">
	import { onMount } from 'svelte';
	import { Proof, verify } from 'o1js';
	import { GeoPointInPolygonCommitment } from '../../../contracts/src/model/private/Commitment';
	let L;

	let jsonInput = '';
	let map;
	let polygonLayer;

	onMount(async () => {
		L = await import('leaflet');
		map = L.map('proof-map').setView([0, 0], 13); // Default to a world view
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(map);
	});

	function handleJsonInput(event) {
		jsonInput = event.target.value;
		try {
			const proofObject = JSON.parse(jsonInput);
			const vertices = Object.values(proofObject.polygon); // Get the vertices as an array
			displayPolygon(vertices);
		} catch (error) {
			console.error('Error parsing JSON:', error);
			// Reset the map and polygonLayer if the JSON is invalid
			if (polygonLayer) {
				polygonLayer.remove();
				polygonLayer = null;
			}
			map.setView([0, 0], 2); // Reset map view to default
		}
	}

	function displayPolygon(vertices) {
		// Remove previous polygon if exists
		if (polygonLayer) {
			polygonLayer.remove();
		}
		// Parse and convert coordinates, then add polygon to the map
		const latLngs = vertices.map((vertex) => convertPoint(vertex));
		polygonLayer = L.polygon(latLngs, { color: 'yellow' }).addTo(map);
		map.fitBounds(polygonLayer.getBounds());
	}

	function convertPoint(vertex) {
		// Convert the factor back into floating point representation
		const latitude = parseInt(vertex.latitude.magnitude) / parseInt(vertex.factor.magnitude);
		const longitude = parseInt(vertex.longitude.magnitude) / parseInt(vertex.factor.magnitude);
		return [latitude, longitude];
	}

	async function verifyProof() {
		try {
			const proofObject = JSON.parse(jsonInput);
      const isOk: Boolean = await verify(proofObject.proof, proofObject.geoPointInPolygonCircuitVerificationKey)
			if (isOk) {
				polygonLayer.setStyle({ color: 'green' });
				L.popup()
					.setLatLng(polygonLayer.getBounds().getCenter())
					.setContent('Location verified successfully! You have just proved to a third-party that your location is within this polygon, without revealing your exact coordinates.')
					.openOn(map);
			} else {
				polygonLayer.setStyle({ color: 'red' });
				console.error('Proof verification failed');
			}
		} catch (error) {
			polygonLayer.setStyle({ color: 'red' });
			console.error('Error verifying proof:', error);
		}
	}

</script>

<textarea bind:value={jsonInput} on:input={handleJsonInput} />
<button on:click={verifyProof} disabled={!jsonInput}>Verify Proof</button>
<div id="proof-map" style="height: 400px;" />

<style>
	.leaflet-popup-content {
		background-color: #f0f0f0;
		padding: 8px;
		border-radius: 4px;
	}

	.leaflet-popup-tip-container {
		display: none; /* Hide the tip arrow for a cleaner popup */
	}
</style>
