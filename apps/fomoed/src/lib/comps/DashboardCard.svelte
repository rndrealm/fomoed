<script>
	import { getContext } from 'svelte';

	export let isChartCard = false;
	export let disablePadding = false;
	export let hideCard = false;

	const isFullscreenCardStore = getContext('isFullscreenCardStore');
</script>

{#if hideCard}
	<slot />
{:else}
	<div
		class:isChartCard
		class="{!isChartCard &&
			'z-[1000] px-[30px] py-[22px]'} bg-[#080808] rounded-[15px] border border-[#141414] grid place-items-center w-full h-full -desktop:snap-center overflow-hidden duration-500"
		class:!p-0={disablePadding}
		class:!border-transparent={$isFullscreenCardStore}
		class:!rounded-none={$isFullscreenCardStore}
	>
		<slot />
	</div>
{/if}

<style>
	.isChartCard {
		@apply desktop:py-[22px] -desktop:py-3;
	}
</style>
