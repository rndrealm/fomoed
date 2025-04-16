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

	$: mounted && dashboardService.setLastDisplayedChartIndex(page);

	onMount(() => {
		page = dashboardService.getLastDisplayedChartIndex();
		mounted = true;
	});

	const components = [
		DetailedCfgiCard,
		SimpleCfgiCard,
		LiqHeatmapCard,
		LiqMapCard,
		ExchangeLiqMapCard
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
				chart.resize();
				chart.canvas.style.opacity = 1;

				fullscreenAnimCompleteCounterStore.update((n) => n + 1);
			}
		});
	}

	function goOutFullscreen() {
		isFullscreenCardStore.set(false);

		chart.canvas.style.opacity = 0;

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

				chart.resize(0, 0);

				await tick();

				chart.resize();

				chart.canvas.style.opacity = 1;

				fullscreenAnimCompleteCounterStore.update((n) => n + 1);
			}
		});
	}

	let chartCardContainer: HTMLElement;
	let chartCardComponent: any;

	let chart: any;
</script>

<div class="w-full desktop:h-[450px] -desktop:h-full -desktop:flex flex-col relative">
	{#if $isDesktop === true}
		<div
			bind:this={chartCardContainer}
			class="inset-0 z-40"
			class:absolute={!isFullscreen}
			class:fixed={isFullscreen}
			transition:fade={{ duration: 200 }}
		>
			<svelte:component this={components[page]} bind:chart />
		</div>

		<div
			class="absolute inset-0 flex items-center h-full z-50 pointer-events-none duration-200"
			class:opacity-0={isFullscreen}
		>
			<div class="flex w-full relative">
				<button on:click={() => goLeft()} class="-translate-x-1/2 pointer-events-auto p-4">
					<CarouselArrowLeft />
				</button>

				<div class="flex-grow"></div>

				<button on:click={() => goRight()} class="translate-x-1/2 pointer-events-auto p-4">
					<CarouselArrowRight />
				</button>
			</div>
		</div>
	{:else if $isDesktop === false}
		<div
			bind:this={mobileCarouselContainer}
			class="w-full flex overflow-x-scroll snap-x snap-mandatory px-3 no-scrollbar flex-grow"
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
		class="opacity-75 hover:opacity-100 duration-200 z-50 {isFullscreen && $isDesktop
			? 'translate-y-3'
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
		@apply rounded-xl border border-[#FFFFFF1A] bg-[#0F0D0D] active:scale-90 duration-100;
	}

	#fullscreen-btn:not(.isFullscreen) {
		@apply absolute bottom-4 left-4 -desktop:bottom-12 -desktop:left-8 p-4;
	}

	#fullscreen-btn.isFullscreen {
		@apply fixed top-4 right-4 p-2;
	}

	:global(canvas) {
		@apply duration-150 transition-opacity ease-linear cursor-pointer;
	}
</style>
