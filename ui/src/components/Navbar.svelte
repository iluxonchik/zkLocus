<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    function toggleDrawer() {
      dispatch('toggleDrawer');
    }
  </script>
  
  <nav class="p-4 shadow-lg">
    <button on:click={toggleDrawer} class="text-xl">
      🍔
    </button>
  </nav>
  