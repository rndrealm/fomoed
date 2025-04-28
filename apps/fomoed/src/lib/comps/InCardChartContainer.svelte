<script lang="ts">
	import SimpleBar from 'simplebar';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import LoadingAnim from './animations/LoadingAnim.svelte';

	export let loading = false;

	onMount(() => {
		// new SimpleBar(container, {
		// 	autoHide: false,
		// 	scrollbarMinSize: 50
		// });
	});

	let container: HTMLElement;
</script>

<div class="relative w-full h-full rounded-[15px]">
	<div class="chart_border"></div>
	<div class="relative bg-[#080808] h-full px-3 pb-16 pt-4 rounded-[15px]">
		<div bind:this={container} class="w-full h-full no-scrollbar" class:opacity-0={loading}>
			<div class="-desktop:h-full desktop:h-full -desktop:pb-3">
				<slot />
			</div>
		</div>

		{#if loading}
			<div out:fade class="absolute inset-0 grid place-items-center">
				<!-- <p class="text-[15px] font-semibold text-[#FFFFFF]">Fetching Charts...</p> -->
				<p
					class="text-[15px] font-semibold bg-gradient-to-r from-[#FFFFFF] to-[#999999] text-transparent bg-clip-text"
				>
					Fetching Charts...
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.simplebar-content) {
		@apply h-full;
	}
</style>
