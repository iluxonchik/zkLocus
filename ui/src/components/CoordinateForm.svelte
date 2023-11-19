<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    let latitude = '';
    let longitude = '';
  
    function setLocation() {
      // Validate coordinates here and then emit
      dispatch('locationSet', { latitude, longitude });
    }
  </script>
  
  <form on:submit|preventDefault={setLocation} class="flex flex-col space-y-2">
    <input type="text" bind:value={latitude} placeholder="Latitude" class="input input-bordered w-full max-w-xs" />
    <input type="text" bind:value={longitude} placeholder="Longitude" class="input input-bordered w-full max-w-xs" />
    <button type="submit" class="btn btn-primary">Set Location</button>
  </form>
  