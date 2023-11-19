<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    export let coordinates;
    export let polygonPoints;
  
    // This mock function simulates the proof generation
    // In a real scenario, you would replace this with an API call or some other asynchronous operation
    async function generateProof() {
      const proof = { inside: true }; // Mock proof
      dispatch('proofGenerated', { proof: JSON.stringify(proof) });
    }
  </script>
    
    <button on:click={generateProof} class="btn btn-primary" disabled={!coordinates || polygonPoints.length !== 3}>
    Generate Proof
  </button>
  