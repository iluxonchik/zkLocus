<script>
    export let points;
</script>

{#each points as point}
    <div>Lat: {point.lat.toFixed(7)}, Lng: {point.lng.toFixed(7)}</div>
{/each}
