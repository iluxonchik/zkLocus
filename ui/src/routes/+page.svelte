<script>
	import Navbar from '../components/Navbar.svelte';
    import Drawer from '../components/Drawer.svelte';
    import MapDisplay from '../components/MapDisplay.svelte';
    import CoordinateForm from '../components/CoordinateForm.svelte';
    import useCurrentLocation from '../components/useCurrentLocation.svelte';
    import PolygonTool from '../components/PolygonTool.svelte';
    import ProofGenerator from '../components/ProofGenerator.svelte';
    import ProofDisplay from '../components/ProofDisplay.svelte';
  
    let drawerOpen = false;
    let currentCoordinates;
    let polygonPoints = [];
    let proof;
  
    // Event handlers
    function handleLocationSet(event) {
      currentCoordinates = event.detail;
      // You'll need to add functionality to place a marker on the map with these coordinates
    }
  
    function handleCurrentLocationFound(event) {
      currentCoordinates = event.detail;
      // Same here for placing a marker
    }
  
    function handlePolygonUpdated(event) {
      polygonPoints = event.detail.points;
      // Logic to update the polygon on the map goes here
    }
  
    function handleProofGenerated(event) {
      proof = event.detail.proof;
    }
  
    // Drawer control functions
    function toggleDrawer() {
      drawerOpen = !drawerOpen;
    }
  
    function closeDrawer() {
      drawerOpen = false;
    }
  </script>
  
  <Navbar on:toggleDrawer={toggleDrawer} />
  <Drawer {drawerOpen} closeDrawer={closeDrawer} />
  <MapDisplay {currentCoordinates} {polygonPoints} />
  <div class="p-4">
    <CoordinateForm on:locationSet={handleLocationSet} />
    <useCurrentLocation on:currentLocationFound={handleCurrentLocationFound} />
    <PolygonTool on:polygonUpdated={handlePolygonUpdated} />
    {#if polygonPoints.length === 3 && currentCoordinates}
      <ProofGenerator {currentCoordinates} {polygonPoints} on:proofGenerated={handleProofGenerated} />
    {/if}
    {#if proof}
      <ProofDisplay {proof} />
    {/if}
  </div>
  
  <style>
    /* Additional styles can go here */
  </style>
  