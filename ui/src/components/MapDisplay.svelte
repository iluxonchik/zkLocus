<script>
	import { browser } from '$app/environment';
    import { onMount } from 'svelte';
  let L;

  onMount(() => {
    if (browser) {
      L = require('leaflet');
      // Initialize the map with Leaflet here since it's now on the client-side
    }
  });
  
    export let initialCoordinates = [51.505, -0.09]; // Default to London
    export let setMarker;
    export let drawPolygon;
    let map;
  
    onMount(() => {
        if (browser) {
            map = L.map('map').setView(initialCoordinates, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
      }
  
      // This is where you'd set up event listeners for map interactions, like clicking to add polygon points
      // and potentially a handler for the setMarker and drawPolygon functions
    });
</script>

<div id="map" class="h-full" />
