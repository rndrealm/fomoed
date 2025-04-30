<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		restrictDimensions = true,
		children,
		zIndex = 10
	}: { restrictDimensions: boolean; children: Snippet; zIndex?: number } = $props();
</script>

<div transition:fade={{ duration: 200 }} class="fixed w-screen h-screen inset-0">
	<div
		class="w-full h-full grid place-items-center bg-[#06030280] backdrop-blur-sm -desktop:px-4 relative"
		style="z-index: {zIndex};"
	>
		<div
			class="bg-[#0F0D0D] border border-[#FFFFFF1A] grid place-items-center rounded-[20px] -desktop:w-full"
			class:restrictDimensions
		>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.restrictDimensions {
		width: 470px;
		height: 420px;
	}
</style>
