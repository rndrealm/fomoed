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

<div class="flex gap-1 overflow-auto no-scrollbar font-inter">
	{#each newsFilterOpts as option}
		<button
			class="px-3 py-[2px] rounded-[8px] text-sm font-medium transition-all duration-300 ease-in-out border border-transparent w-fit hover:bg-[#252525]"
			class:active={active === option.value}
			onclick={() => {
				active = option.value;
				onChange(option.value);
			}}
			aria-pressed={active === option.value}
		>
			<div class="font-medium text-[15px] text-[#5F5F5F] whitespace-nowrap">
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
		background-image: linear-gradient(#000, #000), linear-gradient(to bottom, #020100, #bd4618);
		/* border: 1px solid; */
		/* border-image: radial-gradient(366.98% 261.54% at 50% -61.54%, #020100 0%, #631B06 63.11%, #8B2505 71.96%, #BD4618 83.51%, #F7984B 91.04%); */
		border: double 1px transparent;
		transition:
			border 0.3s ease-in-out,
			background-image 0.3s ease-in-out;
	}

	.active > div {
		@apply bg-gradient-to-r from-[#FF3B10BF] to-[#F3C111BF] text-transparent bg-clip-text;
		color: white;
	}

	button:not(.active):hover > div {
		@apply text-neutral-300;
	}
</style>
