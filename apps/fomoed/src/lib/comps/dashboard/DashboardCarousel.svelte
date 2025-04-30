<script lang="ts">
	import CarouselArrowLeft from '$lib/icons/CarouselArrowLeft.svelte';
	import CarouselArrowRight from '$lib/icons/CarouselArrowRight.svelte';
	import IconExpand from '$lib/icons/IconExpand.svelte';
	import { disableDashboardScroll, innerHeight, innerWidth, isDesktop } from '$lib/stores/ui';
	import { fade } from 'svelte/transition';
	import ScrollerDots from '../ScrollerDots.svelte';
	import DetailedCfgiCard from './widgets/DetailedCfgi/DetailedCfgiCard.svelte';
	import ExchangeLiqMapCard from './widgets/ExchangeLiqMap/ExchangeLiqMapCard.svelte';
	import LiqHeatmapCard from './widgets/LiqHeatmap/LiqHeatmapCard.svelte';
	import LiqMapCard from './widgets/LiqMap/LiqMapCard.svelte';
	import SimpleCfgiCard from './widgets/SimpleCfgi/SimpleCfgiCard.svelte';
	import { getContext, onMount, setContext, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import IconCollapse from '$lib/icons/IconCollapse.svelte';
	import anime from 'animejs';
	import type { DashboardService } from '$ts/client/services/DashboardService.client';
	import { browser } from '$app/environment';
	import { chart_page } from '$lib/stores';
	import CignalsCard from './widgets/CignalsChart/CignalsCard.svelte';

	let mounted = false;

	const dashboardService = getContext<DashboardService>('dashboardService');

	export let isFullscreen = false;

	const isFullscreenCardStore = writable(false);
	const fullscreenAnimCompleteCounterStore = writable(0);

	setContext('isFullscreenCardStore', isFullscreenCardStore);
	setContext('fullscreenAnimCompleteCounterStore', fullscreenAnimCompleteCounterStore);

	let page = browser ? dashboardService.getLastDisplayedChartIndex() : 0;

	function goLeft() {
		page = page === 0 ? components.length - 1 : page - 1;
	}

	function goRight() {
		page = (page + 1) % components.length;
	}

	$: mounted && dashboardService.setLastDisplayedChartIndex($chart_page);

	onMount(() => {
		// page = dashboardService.getLastDisplayedChartIndex();
		chart_page.set(dashboardService.getLastDisplayedChartIndex());
		mounted = true;
	});

	const components = [
		DetailedCfgiCard,
		SimpleCfgiCard,
		LiqHeatmapCard,
		LiqMapCard,
		ExchangeLiqMapCard,
		CignalsCard
	];

	let mobileScrollIndex = 0;
	let mobileCarouselContainer: HTMLElement;

	let originalTop = 0;
	let originalLeft = 0;
	let originalWidth = 0;
	let originalHeight = 0;

	function goInFullscreen() {
		isFullscreen = true;

		isFullscreenCardStore.set(isFullscreen);
		disableDashboardScroll.set(isFullscreen);

		const { top, left, width, height } = chartCardContainer.getBoundingClientRect();

		originalTop = top;
		originalLeft = left;
		originalWidth = width;
		originalHeight = height;

		if (chart) {
			chart.canvas.style.opacity = 0;
		}

		anime({
			targets: chartCardContainer,
			top: [top, 0],
			left: [left, 0],
			width: [width, $innerWidth],
			height: [height, $innerHeight],
			duration: 500,
			easing: 'easeOutExpo',
			complete: () => {
				if (chart?.canvas) {
					chart.resize();
					chart.canvas.style.opacity = 1;
				}

				fullscreenAnimCompleteCounterStore.update((n) => n + 1);
			}
		});
	}

	function goOutFullscreen() {
		isFullscreenCardStore.set(false);

		if (chart?.canvas) {
			chart.canvas.style.opacity = 0;
		}

		anime({
			targets: chartCardContainer,
			top: [0, originalTop],
			left: [0, originalLeft],
			width: [$innerWidth, originalWidth],
			height: [$innerHeight, originalHeight],
			duration: 500,
			easing: 'easeOutExpo',
			complete: async () => {
				isFullscreen = false;
				chartCardContainer.style.top = '';
				chartCardContainer.style.left = '';
				chartCardContainer.style.width = '';
				chartCardContainer.style.height = '';

				disableDashboardScroll.set(false);

				chart?.resize(0, 0);

				await tick();

				chart?.resize();

				if (chart?.canvas) {
					chart.canvas.style.opacity = 1;
				}

				fullscreenAnimCompleteCounterStore.update((n) => n + 1);
			}
		});
	}

	let chartCardContainer: HTMLElement;
	let chartCardComponent: any;

	let chart: any;
</script>

<div
	class="w-full desktop:h-[580px] -desktop:h-full -desktop:flex flex-col relative {isFullscreen &&
	$isDesktop
		? 'z-[1000]'
		: ''} "
>
	{#if $isDesktop === true}
		<div
			bind:this={chartCardContainer}
			class="inset-0 z-10"
			class:absolute={!isFullscreen}
			class:fixed={isFullscreen}
			transition:fade={{ duration: 200 }}
		>
			<svelte:component this={components[page]} bind:chart />
		</div>

		<div
			class="absolute inset-0 z-10 flex items-center h-full duration-200 pointer-events-none"
			class:opacity-0={isFullscreen}
		>
			<div class="relative flex w-full">
				<button
					on:click={() => goLeft()}
					class="p-4 translate-x-[-30%] pointer-events-auto rounded-lg bg-[#080808] border border-white/10"
				>
					<CarouselArrowLeft />
				</button>

				<div class="flex-grow"></div>

				<button
					on:click={() => goRight()}
					class="p-4 translate-x-[30%] pointer-events-auto rounded-lg bg-[#080808] border border-white/10"
				>
					<CarouselArrowRight />
				</button>
			</div>
		</div>
	{:else if $isDesktop === false}
		<div
			bind:this={mobileCarouselContainer}
			class="flex flex-grow w-full px-3 overflow-x-scroll snap-x snap-mandatory no-scrollbar"
		>
			{#each components as component, i}
				<div class="flex-shrink-0 snap-center w-[calc(100vw-1.5rem)] relative">
					{#if mobileScrollIndex === i}
						<div
							bind:this={chartCardContainer}
							class="inset-0"
							class:absolute={!isFullscreen}
							class:fixed={isFullscreen}
							transition:fade={{ duration: 200 }}
						>
							<svelte:component this={component} bind:this={chartCardComponent} bind:chart />
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="pt-4">
			<ScrollerDots
				bind:page={mobileScrollIndex}
				pages={components.length}
				container={mobileCarouselContainer}
			></ScrollerDots>
		</div>
	{/if}

	<button
		id="fullscreen-btn"
		class="hover:opacity-100 duration-200 z-10 bg-[#080808] border border-white/10 rounded-lg p-2 {isFullscreen &&
		$isDesktop
			? 'translate-y-3 z-[1000] '
			: ''}"
		on:click={() => (isFullscreen ? goOutFullscreen() : goInFullscreen())}
		class:isFullscreen
	>
		{#if isFullscreen}
			<IconCollapse></IconCollapse>
		{:else}
			<IconExpand></IconExpand>
		{/if}
	</button>
</div>

<style>
	button {
		@apply active:scale-90 duration-100;
	}

	#fullscreen-btn:not(.isFullscreen) {
		@apply absolute md:bottom-4 right-4 -desktop:bottom-[5.5rem] -desktop:right-8;
	}

	#fullscreen-btn.isFullscreen {
		@apply fixed top-4 right-4;
	}

	:global(canvas) {
		@apply duration-150 transition-opacity ease-linear cursor-pointer;
	}
</style>
