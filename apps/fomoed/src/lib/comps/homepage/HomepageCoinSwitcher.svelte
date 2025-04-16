<script lang="ts">
	import BncEmpty from '$lib/icons/coins/BncEmpty.svelte';
	import BncFill from '$lib/icons/coins/BncFill.svelte';
	import BtcEmpty from '$lib/icons/coins/BtcEmpty.svelte';
	import BtcFill from '$lib/icons/coins/BtcFill.svelte';
	import EthEmpty from '$lib/icons/coins/EthEmpty.svelte';
	import EthFill from '$lib/icons/coins/EthFill.svelte';
	import SolEmpty from '$lib/icons/coins/SolEmpty.svelte';
	import SolFill from '$lib/icons/coins/SolFill.svelte';
	import UsdtEmpty from '$lib/icons/coins/UsdtEmpty.svelte';
	import UsdtFill from '$lib/icons/coins/UsdtFill.svelte';
	import { auth_user } from '$lib/stores/user';
	import { createEventDispatcher } from 'svelte';

	export let selectedTicker = 'BTC';

	const dispatch = createEventDispatcher();

	function selectPremium(ticker: string) {
		if ($auth_user?.has_valid_sub) {
			selectedTicker = ticker;
		} else {
			dispatch('get-free-trial');
		}
	}
</script>

<div
	class="absolute top-0 flex justify-center w-full items-end h-full -desktop:mt-2 pointer-events-none"
>
	<div
		style="background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)) padding-box, linear-gradient(180deg, rgba(255, 59, 16, 0.3) -4.26%, rgba(255, 59, 16, 0) 100%) border-box"
		class="-desktop:mx-4 bg-black/50 rounded-[20px] border-transparent border-2 w-[400px] h-[90px] backdrop-blur-xl -sm:px-6 sm:px-[65px] py-[27px] flex justify-between"
	>
		<button on:click={() => (selectedTicker = 'BTC')} class:selected={selectedTicker === 'BTC'}>
			{#if selectedTicker === 'BTC'}
				<BtcFill />
			{:else}
				<BtcEmpty />
			{/if}
		</button>

		<button on:click={() => (selectedTicker = 'ETH')} class:selected={selectedTicker === 'ETH'}>
			{#if selectedTicker === 'ETH'}
				<EthFill />
			{:else}
				<EthEmpty />
			{/if}
		</button>

		<button on:click={() => selectPremium('USDT')} class:enabled={$auth_user?.has_valid_sub}>
			{#if selectedTicker === 'USDT'}
				<UsdtFill />
			{:else}
				<UsdtEmpty />
			{/if}
		</button>

		<button on:click={() => selectPremium('BNC')} class:enabled={$auth_user?.has_valid_sub}>
			{#if selectedTicker === 'BNC'}
				<BncFill />
			{:else}
				<BncEmpty />
			{/if}
		</button>

		<button on:click={() => selectPremium('SOL')} class:enabled={$auth_user?.has_valid_sub}>
			{#if selectedTicker === 'SOL'}
				<SolFill />
			{:else}
				<SolEmpty />
			{/if}
		</button>
	</div>
</div>

<style>
	button {
		@apply hover:brightness-150 duration-100 active:brightness-90 text-[#020202];
	}

	button.enabled {
		@apply text-primary;
	}
</style>
