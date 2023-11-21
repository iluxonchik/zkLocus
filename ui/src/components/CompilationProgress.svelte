<script>
    export let status;
    let geoPointProviderCircuitStatus;
    let geoPointInPolygonCircuitStatus;    

    $: if (status.geoPointProviderCompiled) {
        geoPointProviderCircuitStatus = 'Compiled';
    } else if (status.geoPointProviderIsCompiling) {
        geoPointProviderCircuitStatus = 'Compiling...';
    } else {
        geoPointProviderCircuitStatus = 'Not compiled';
    }

    $: if (status.geoPointInPolygonCompiled) {
        geoPointInPolygonCircuitStatus = 'Compiled';
    } else if (status.geoPointInPolygonIsCompiling) {
        geoPointInPolygonCircuitStatus = 'Compiling...';
    } else {
        geoPointInPolygonCircuitStatus = 'Not compiled';
    }

</script>

<div class="compilation-status">
    <div>GeoPointProviderCircuit: {geoPointProviderCircuitStatus}</div>
    <div>GeoPointInPolygonCircuit: {geoPointInPolygonCircuitStatus}</div>
</div>

<style>
    .compilation-status {
        /* Add styles for your compilation status console */
    }
</style>
