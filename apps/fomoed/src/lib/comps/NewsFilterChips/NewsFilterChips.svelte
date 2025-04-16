<script lang="ts">
	import { newsFilterOpts } from '$ts/client/services/NewsService.client.svelte';
	import type { NewsFilterVal } from '$ts/types';

	let {
		active = $bindable<NewsFilterVal>(),
		onChange = (value: NewsFilterVal) => {}
	}: {
		active: NewsFilterVal;
		onChange: (value: NewsFilterVal) => void;
	} = $props();
</script>

<div class="flex flex-wrap gap-2 font-inter">
	{#each newsFilterOpts as option}
		<button
			class="px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out bg-[#1C1C1C] border border-transparent hover:bg-[#252525]"
			class:active={active === option.value}
			onclick={() => {
				active = option.value;
				onChange(option.value);
			}}
			aria-pressed={active === option.value}
		>
			<div class="text-neutral-500 font-semibold">
				{option.label}
			</div>
		</button>
	{/each}
</div>

<style>
	.active {
		@apply relative;
		background-origin: border-box;
		background-clip: padding-box, border-box;
		background-image: linear-gradient(#1c1c1c, #1c1c1c),
			linear-gradient(to right, #ff3b10bf, #f3c111bf);
		border: double 1px transparent;
		transition:
			border 0.3s ease-in-out,
			background-image 0.3s ease-in-out;
	}

	.active > div {
		@apply bg-gradient-to-r from-[#FF3B10BF] to-[#F3C111BF] text-transparent bg-clip-text;
	}

	button:not(.active):hover > div {
		@apply text-neutral-300;
	}
</style>
