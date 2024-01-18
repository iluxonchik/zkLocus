<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
	import { Mina, PublicKey } from 'o1js';
	import type { ZKGeoPointInPolygonProof } from 'zklocus/src/api/proofs/ZKGeoPointInPolygonProof';
  import {GeoPointWithMetadataContract} from 'zklocus';
  
    const dispatch = createEventDispatcher();
    let auroWalletInstalled = false;
    let connectedAccount = null;
    //let zkAppAddress = 'B62qqp4ymLtDwEmHnPF4vb68UjEua9jvbotL6tFZzFM6aTok8wHMSTX'; // non-combined proof
    let zkAppAddress = 'B62qkvhdMJsbThRqF7e8myUVonw8hAodUFFT2RmRb2tirqw1U7Jv9q1';
    let transactionHash = '';
    let transactionError = '';
    export let proof: ZKGeoPointInPolygonProof;
    let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
    Mina.setActiveInstance(Berkeley);
  
    onMount(() => {
      if (browser && typeof window.mina !== 'undefined') {
        auroWalletInstalled = true;
      }
    });
  
    async function connectWallet() {
      if (!auroWalletInstalled) return;
  
      const accounts = await window.mina.requestAccounts().catch((err) => {
        console.error('Error requesting accounts:', err);
        return [];
      });
  
      if (accounts.length > 0) {
        connectedAccount = accounts[0];
        dispatch('walletConnected', { account: connectedAccount });
      }
    }

    async function buildPIPTransaction() {
        console.log("Preparing zkLocus transaction...")
        const zkAppPublicKey: PublicKey = PublicKey.fromBase58(zkAppAddress);
        const zkAppInstance = new GeoPointWithMetadataContract(zkAppPublicKey);
        const txn = await Mina.transaction(() => {
        zkAppInstance.submitProof(proof.proof);
      });
      console.log("\tProving transaction...");
      await txn.prove();
      console.log("\tTransaction perpared! ✅");
      return txn;
    }
  
    async function submitTransaction() {
      if (!zkAppAddress) return;
  
      // Dummy transaction object - replace with actual transaction logic
        const transaction = await buildPIPTransaction();

      const result = await window.mina.sendTransaction({
        transaction: transaction.toJSON(),
        feePayer: {
          memo: "zkLocus Proof + Metadata",
        },
      }).catch((err) => {
        transactionError = err.message || 'Unknown error submitting transaction';
        console.error('Transaction error:', transactionError);
        return null;
      });
  
      if (result && result.hash) {
        transactionHash = result.hash;
        dispatch('transactionSubmitted', { hash: transactionHash });
      }
    }
  
  </script>
  
  {#if auroWalletInstalled}
    {#if connectedAccount}
      <div>
        Connected as: {connectedAccount}
        <input bind:value={zkAppAddress} placeholder="Enter zkApp Address" class="input input-bordered" />
        <button on:click={submitTransaction} class="btn btn-primary" disabled={!zkAppAddress}>Submit Proof</button>
      </div>
      {#if transactionHash}
        <div>
          <p><a href={`https://minascan.io/berkeley/tx/${transactionHash}?type=zk-tx`} target="_blank">🔗 View Transaction On MinaScan.io</a></p>
          <p>Transaction Hash: {transactionHash} </p>
        </div>
      {/if}
      {#if transactionError}
        <div class="text-error">Error: {transactionError}</div>
      {/if}
    {:else}
      <button on:click={connectWallet} class="btn btn-primary">Connect to Auro Wallet</button>
    {/if}
  {:else}
    <div class="text-error">Auro Wallet is not installed.</div>
  {/if}
  
  <style>
    /* Additional styling as needed */
  </style>
  