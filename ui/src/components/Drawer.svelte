<script>
    export let show = false;
    export let closeDrawer;
  
    function handleClick() {
      if (closeDrawer) {
        closeDrawer();
      }
    }
  </script>
  
  <aside class={`fixed inset-y-0 left-0 transform ${show ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
    <div class="p-6 bg-white w-64 h-full">
      <button on:click={handleClick} class="text-xl">
        Close
      </button>
      <!-- Drawer content here -->
    </div>
  </aside>
  