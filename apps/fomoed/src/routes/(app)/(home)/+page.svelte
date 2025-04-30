<script lang="ts">
	import AppNav from '$lib/comps/AppNav.svelte';
	import DashboardCard from '$lib/comps/DashboardCard.svelte';
	import IndicatorCardV3 from '$lib/comps/IndicatorCardV3.svelte';
	import { coinstats_global_data, coinstats_selected_coin } from '$lib/stores';
	import ScrollerDots from '$lib/comps/ScrollerDots.svelte';
	import Footer from '$lib/comps/Footer.svelte';
	import DashboardCarousel from '$lib/comps/dashboard/DashboardCarousel.svelte';
	import { disableDashboardScroll, innerHeight, isDesktop, isMobile } from '$lib/stores/ui';
	import NewsCardContent from '$lib/comps/dashboard/NewsCardContent.svelte';
	import NavBar from '$lib/comps/NewNavbar/NavBar.svelte';
	import TokenDetails from '$lib/comps/TokenDetails.svelte';
	import TokenDominace from '$lib/comps/TokenDominace.svelte';
	import SelectToken from '$lib/comps/SelectToken.svelte';
	import DashboardNews from '$lib/comps/dashboard/DashboardNews.svelte';
	import NewsAssetPriceRow from '$lib/comps/NewsAssetPriceRow/NewsAssetPriceRow.svelte';

	let smallChartsCointainer: HTMLElement;
	let scrollY = 0;

	let isCarouselFullscreen = false;
</script>

<main
	class="relative z-0 overflow-y-scroll -desktop:snap-y no-scrollbar snap-mandatory bg-[#0f0f0f]"
	class:!overflow-hidden={$disableDashboardScroll}
	style="height: {$innerHeight}px;"
	onscroll={(e) => (scrollY = e.target?.scrollTop)}
>
	<!-- <div
		class="fixed top-0 w-full z-40 -desktop:bg-[50%_50%]"
		style="backdrop-filter: brightness({1 - Math.min(0.7, scrollY / 100)}) blur(16px);"
	> -->

	<NavBar />

	<!-- <AppNav showCurrencyDropdown showsAllNewsLinkOnDesktop /> -->

	<!-- <div class="bg-[url(/background/dashboard.svg)] inset-0 fixed min-h-screen bg-cover -z-10"></div> -->

	<div
		class="flex-grow grid place-items-center desktop:pb-8 desktop:mx-4 pt-[5.5rem] md:pt-[5rem] duration-200 snap-start"
		class:opacity-0={$isDesktop === null}
	>
		<div
			class="grid grid-cols-6 gap-[7px] mx-auto h-full desktop:pb-6 w-full max-w-[1050px] desktop:grid-rows-[1fr_3fr]"
		>
			<div class="">
				<div class="flex desktop:col-span-6 w-full max-w-[1050px] mx-auto px-3 md:px-0">
					<SelectToken />
				</div>
			</div>
			<div
				bind:this={smallChartsCointainer}
				class="-desktop:flex -desktop:gap-x-2 -desktop:h-[122px] -desktop:overflow-x-scroll desktop:grid grid-cols-subgrid col-span-6 no-scrollbar -desktop:snap-x -desktop:snap-mandatory -desktop:px-3 max-h-[122px] self-end"
			>
				<div class="-desktop:flex-shrink-0 -desktop:w-5/6 desktop:col-span-2">
					<TokenDetails
						change={$coinstats_global_data?.marketCapChange}
						value={$coinstats_selected_coin?.marketCap.toLocaleString()}
						title={$coinstats_selected_coin?.symbol}
						titleLabel="Market Cap"
						prefix="$"
						postfix=""
					/>
				</div>

				<div class="-desktop:flex-shrink-0 -desktop:w-5/6 desktop:col-span-2">
					<TokenDetails
						value={$coinstats_selected_coin?.volume.toLocaleString()}
						title={$coinstats_selected_coin?.symbol}
						titleLabel="Volume 24H"
						prefix="$"
						postfix=""
					/>
				</div>

				<div class="flex flex-col gap-2 -desktop:flex-shrink-0 -desktop:w-5/6 desktop:col-span-2">
					<div class="flex-1">
						<TokenDominace
							change={$coinstats_global_data?.btcDominanceChange}
							value={$coinstats_global_data?.btcDominance.toLocaleString()}
							title="BTC"
							titleLabel="Dominance"
							prefix=""
							postfix="%"
						/>
					</div>

					<div class="flex-1">
						<TokenDominace
							change={$coinstats_selected_coin?.priceChange}
							value={$coinstats_selected_coin?.price.toLocaleString()}
							title={$coinstats_selected_coin?.symbol}
							titleLabel="Price"
							prefix="$"
							postfix=""
						/>
					</div>
				</div>

				<!-- <div class="-desktop:flex-shrink-0 -desktop:w-5/6">
					<DashboardCard>
						<HomepageSmallChart
							change={$coinstats_selected_coin?.priceChange}
							value={$coinstats_selected_coin?.price.toLocaleString()}
							title="{$coinstats_selected_coin?.symbol} Price"
							prefix="$"
							postfix=""
						/>
					</DashboardCard>
				</div> -->
			</div>

			<div class="col-span-6 mt-2 mb-6 -desktop:mb-2 desktop:hidden">
				<ScrollerDots pages={4} container={smallChartsCointainer}></ScrollerDots>
			</div>

			{#if $isDesktop}
				<div class="grid col-span-6 grid-cols-subgrid">
					<div class="relative flex-grow h-full col-span-4 -desktop:col-span-6">
						<DashboardCarousel />
					</div>

					<div class="flex flex-col justify-between col-span-2">
						<div
							class="max-h-[500px] h-[460px] bg-[#070707] rounded-[15px] py-7 border border-[#141414]"
						>
							<h3 class="pb-2 text-xl font-medium text-center">Fear and Greed Index</h3>
							<IndicatorCardV3 />
						</div>
						<div class="pb-6 rounded-r-[15px] bg-[#080808]">
							<NewsAssetPriceRow />
						</div>
					</div>
				</div>

				<div class="col-span-6 -desktop:pt-4">
					<!-- <DashboardCard disablePadding hideCard={!$isDesktop}>
						<NewsCardContent />
					</DashboardCard> -->
					<DashboardNews />
				</div>
			{/if}
		</div>
	</div>

	{#if $isMobile}
		<div
			class="px-0 mx-3 mt-3 mb-3 h-[400px] pt-7 pb-6 border border-[#141414] rounded-[15px] bg-[#070707]"
		>
			<IndicatorCardV3 />
		</div>

		<div
			class="snap-end mx-3 flex flex-col justify-end pb-4 pt-20 -translate-y-20 relative {isCarouselFullscreen &&
				'z-50'}"
			style="height: {$innerHeight}px"
		>
			<DashboardCarousel bind:isFullscreen={isCarouselFullscreen} />
		</div>

		<!-- <DashboardCard disablePadding hideCard={!$isDesktop}>
			<NewsCardContent />
		</DashboardCard> -->
		<div class="mx-3 snap-end">
			<DashboardNews />
		</div>
	{/if}

	<div class="snap-end">
		<Footer></Footer>
	</div>
</main>
