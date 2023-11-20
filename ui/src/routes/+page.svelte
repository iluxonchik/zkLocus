<script>
  import MapComponent from '../components/MapComponent.svelte';
  import LocationInput from '../components/LocationInput.svelte';
  import ProofGeneration from '../components/ProofGeneration.svelte';
	import LocateMe from '../components/LocateMe.svelte';
  import PolygonPointsDisplay from '../components/PolygonPointsDisplay.svelte';

  let latitude = 45.65136267101511.toFixed(7); // Default latitude
  let longitude = 25.612004326029343.toFixed(7); // Default longitude
  let polygonPoints = [];
  let proofGenerated = false;

  // Example generateProof function
  function generateProof() {
    // Mock proof generation logic
    proofGenerated = true;
    return { proof: 'Some proof data' };
  }

  function setPolygonPoints(newPoints) {
    polygonPoints = newPoints.map(point => ({
      lat: point.lat,
      lng: point.lng
    }));
  }

  export function locateUser() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        let latitudeRaw = position.coords.latitude;
        let longitudeRaw = position.coords.longitude;
        latitude = latitudeRaw.toFixed(7);
        longitude = longitudeRaw.toFixed(7);
      });
    } else {
      console.error('Geolocation is not available.');
    }
  }

  function handleUpdateCoords(event) {
    latitude = event.detail.latitude;
    longitude = event.detail.longitude;
  }

  $: canGenerateProof = latitude !== undefined && longitude !== undefined && polygonPoints.length === 3;


  // Call locateUser on component mount or based on some user action
</script>

<LocationInput bind:latitude bind:longitude />
<MapComponent {latitude} {longitude} {setPolygonPoints} {proofGenerated} on:updateCoords={handleUpdateCoords} />
<LocateMe handler={locateUser}/>
<PolygonPointsDisplay points={polygonPoints} />
<ProofGeneration {generateProof} {canGenerateProof} />

