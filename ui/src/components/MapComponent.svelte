<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte'
    let L;

    export let latitude;
    export let longitude;
    export let setPolygonPoints;
    export let proofGenerated = false;
    export let mapId: string = 'map';

    
    let map;
    let marker;
    let polygon;
    let polygonPoints = [];

    const dispatch = createEventDispatcher()


    onMount(async () => {
        L = await import('leaflet');
        initializeMap();
        map.on('click', addPolygonPoint);
    });

    function createDotIcon() {
     return L.divIcon({
        html: '<div class="leaflet-dot-icon"></div>',
        iconSize: [10, 10], // size of the icon
        iconAnchor: [5, 5]  // point of the icon which will correspond to marker's location
    });
}

    function initializeMap() {
        map = L.map(mapId).setView([latitude, longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
        marker.on('dragend', function(event) {
        var position = event.target.getLatLng();
        latitude = position.lat.toFixed(7); // Update latitude with precision
        longitude = position.lng.toFixed(7); // Update longitude with precision
        // Dispatch a custom event or call a prop method to update the parent's state
        dispatch('updateCoords', { latitude, longitude });
    });

    }
    

    $: if (map && marker) {
        marker.setLatLng([latitude, longitude]);
        map.panTo([latitude, longitude]);
    }

    $: if (polygon && proofGenerated) {
    polygon.setStyle({ fillColor: 'yellow' });
    }

    function addPolygonPoint(e) {
        if (polygonPoints.length < 3) {
            polygonPoints.push(e.latlng);
            L.marker(e.latlng, { icon: createDotIcon() }).addTo(map);

            if (polygonPoints.length === 3) {
                if(polygon) {
                    polygon.remove();
                }
                polygon = L.polygon(polygonPoints).addTo(map);
                setPolygonPoints(polygonPoints);
            }
        }
    }
</script>

<div id="{mapId}" style="height: 400px;"></div>

<style>
    .leaflet-dot-icon {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: blue;
    }
</style>