<script lang="ts">
	import AppNav from '$lib/comps/AppNav.svelte';
	import DashboardCard from '$lib/comps/DashboardCard.svelte';
	import HomepageSmallChart from '$lib/comps/HomepageSmallChart.svelte';
	import IndicatorCard from '$lib/comps/IndicatorCard.svelte';
	import { coinstats_global_data, coinstats_selected_coin } from '$lib/stores';
	import ScrollerDots from '$lib/comps/ScrollerDots.svelte';
	import Footer from '$lib/comps/Footer.svelte';
	import DashboardCarousel from '$lib/comps/dashboard/DashboardCarousel.svelte';
	import { disableDashboardScroll, innerHeight, isDesktop, isMobile } from '$lib/stores/ui';
	import NewsCardContent from '$lib/comps/dashboard/NewsCardContent.svelte';

	let smallChartsCointainer: HTMLElement;
	let scrollY = 0;

	let isCarouselFullscreen = false;
</script>

<main
	class="-desktop:snap-y overflow-y-scroll no-scrollbar snap-mandatory relative z-0"
	class:!overflow-hidden={$disableDashboardScroll}
	style="height: {$innerHeight}px;"
	onscroll={(e) => (scrollY = e.target?.scrollTop)}
>
	<div
		class="fixed top-0 w-full z-40 -desktop:bg-[50%_50%]"
		style="backdrop-filter: brightness({1 - Math.min(0.7, scrollY / 100)}) blur(16px);"
	>
		<AppNav showCurrencyDropdown showsAllNewsLinkOnDesktop />
	</div>

	<div class="bg-[url(/background/dashboard.svg)] inset-0 fixed min-h-screen bg-cover -z-10"></div>

	<div
		class="flex-grow grid place-items-center desktop:pb-8 desktop:mx-4 duration-200 pt-20 snap-start"
		class:opacity-0={$isDesktop === null}
	>
		<div
			class="grid grid-cols-6 gap-[7px] mx-auto h-full desktop:pb-6 w-full max-w-[1050px] desktop:grid-rows-[1fr_3fr]"
		>
			<div
				bind:this={smallChartsCointainer}
				class="-desktop:flex -desktop:gap-x-2 -desktop:h-[148px] -desktop:overflow-x-scroll desktop:grid grid-cols-subgrid col-span-6 no-scrollbar -desktop:snap-x -desktop:snap-mandatory -desktop:px-3"
			>
				<div class="-desktop:flex-shrink-0 -desktop:w-5/6 desktop:col-span-2">
					<DashboardCard>
						<HomepageSmallChart
							change={$coinstats_global_data?.marketCapChange}
							value={$coinstats_selected_coin?.marketCap.toLocaleString()}
							title="{$coinstats_selected_coin?.symbol} Market Cap"
							prefix="$"
							postfix=""
							hideChange
						/>
					</DashboardCard>
				</div>

				<div class="-desktop:flex-shrink-0 -desktop:w-5/6 desktop:col-span-2">
					<DashboardCard>
						<HomepageSmallChart
							value={$coinstats_selected_coin?.volume.toLocaleString()}
							title="{$coinstats_selected_coin?.symbol} Volume 24H"
							prefix="$"
							postfix=""
							hideChange
						/>
					</DashboardCard>
				</div>

				<div class="-desktop:flex-shrink-0 -desktop:w-5/6">
					<DashboardCard>
						<HomepageSmallChart
							change={$coinstats_global_data?.btcDominanceChange}
							value={$coinstats_global_data?.btcDominance.toLocaleString()}
							title="BTC Dominance"
							prefix=""
							postfix="%"
						/>
					</DashboardCard>
				</div>

				<div class="-desktop:flex-shrink-0 -desktop:w-5/6">
					<DashboardCard>
						<HomepageSmallChart
							change={$coinstats_selected_coin?.priceChange}
							value={$coinstats_selected_coin?.price.toLocaleString()}
							title="{$coinstats_selected_coin?.symbol} Price"
							prefix="$"
							postfix=""
						/>
					</DashboardCard>
				</div>
			</div>

			<div class="col-span-6 mb-6 -desktop:mb-2 mt-2 desktop:hidden">
				<ScrollerDots pages={4} container={smallChartsCointainer}></ScrollerDots>
			</div>

			{#if $isDesktop}
				<div class="col-span-6 grid grid-cols-subgrid">
					<div class="col-span-4 -desktop:col-span-6 h-full flex-grow relative">
						<DashboardCarousel />
					</div>

					<div class="max-h-[500px] col-span-2 h-[450px]">
						<IndicatorCard />
					</div>
				</div>

				<div class="col-span-6 -desktop:pt-4">
					<DashboardCard disablePadding hideCard={!$isDesktop}>
						<NewsCardContent />
					</DashboardCard>
				</div>
			{/if}
		</div>
	</div>

	{#if $isMobile}
		<div class="px-3 h-[450px] pb-2 pt-2">
			<IndicatorCard />
		</div>

		<div
			class="snap-end flex flex-col justify-end pb-4 pt-20 -translate-y-20 relative {isCarouselFullscreen &&
				'z-50'}"
			style="height: {$innerHeight}px"
		>
			<DashboardCarousel bind:isFullscreen={isCarouselFullscreen} />
		</div>

		<DashboardCard disablePadding hideCard={!$isDesktop}>
			<NewsCardContent />
		</DashboardCard>
	{/if}

	<div class="snap-end">
		<Footer></Footer>
	</div>
</main>
