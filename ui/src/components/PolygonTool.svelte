<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    let points = [];
  
    // This function would be called when the map is clicked
    function addPointToPolygon(lat, lng) {
      points.push({ lat, lng });
      if (points.length === 3) {
        completePolygon();
      }
      dispatch('polygonUpdated', { points });
    }
  
    function completePolygon() {
      // Here you would send the points to the MapDisplay component to draw the polygon
      dispatch('polygonCompleted', { points });
    }
  
    function clearPolygon() {
      points = [];
      dispatch('polygonCleared');
    }
  </script>
  
  <div>
    <button on:click={clearPolygon} class="btn btn-warning">
      Clear Polygon
    </button>
  </div>
  
  <!-- You will need to handle the map clicks outside of this component, in the MapDisplay.svelte, and then call addPointToPolygon accordingly -->
  