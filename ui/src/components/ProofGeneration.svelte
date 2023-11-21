<script>
    export let generateProof;
    export let canGenerateProof;
  
    let proof;
  
    async function handleClick() {
      proof = await generateProof();
    }
  </script>
  <button on:click={handleClick} disabled={!canGenerateProof}>Generate Proof</button>
  {#if proof}
    <style>
        textarea {
            width: 100%;
            height: 300px;
            font-family: monospace;
            white-space: pre;
            overflow: auto;
        }
    </style>

    <textarea readonly>{JSON.stringify(proof, null, 2)}</textarea>
  {/if}
  