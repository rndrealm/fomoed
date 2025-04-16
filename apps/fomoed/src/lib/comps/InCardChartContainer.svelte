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

<div class="px-1 h-full relative">
	<div bind:this={container} class="w-full h-full no-scrollbar" class:opacity-0={loading}>
		<div class="-desktop:h-full desktop:h-full -desktop:pb-3">
			<slot />
		</div>
	</div>

	{#if loading}
		<div out:fade class="absolute inset-0 grid place-items-center">
			<LoadingAnim />
		</div>
	{/if}
</div>

<style>
	:global(.simplebar-content) {
		@apply h-full;
	}
</style>
