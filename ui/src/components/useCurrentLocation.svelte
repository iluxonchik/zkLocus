<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    async function getCurrentLocation() {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by your browser');
        return;
      }
      function success(position) {
        const { latitude, longitude } = position.coords;
        dispatch('currentLocationFound', { latitude, longitude });
      }
      function error() {
        console.error('Unable to retrieve your location');
      }
      navigator.geolocation.getCurrentPosition(success, error);
    }
  </script>
  
  <button on:click={getCurrentLocation} class="btn btn-accent">
    Use Current Location
  </button>
  