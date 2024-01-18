<script>
    export let handler;
    export let isDisabled = false;

</script>
<button on:click={handler} class="btn btn-primary" disabled={isDisabled}>Locate me</button>
