<script>
    export let latitude;
    export let longitude;

    // latitude and longitude are now reactive and passed from the parent
</script>

Latitude: <input type="text" bind:value={latitude} placeholder="Latitude" />
Longitude: <input type="text" bind:value={longitude} placeholder="Longitude" />
