<script lang="ts">
	import HomepageCoinSwitcher from '$lib/comps/homepage/HomepageCoinSwitcher.svelte';
	import { cfgi_summary, coinstats_coin_list, coinstats_selected_coin } from '$lib/stores';
	import IndicatorCard from '$lib/comps/IndicatorCard.svelte';
	import VideoContainer from '$lib/comps/VideoContainer.svelte';
	import IndicatorGraphicsCard from '$lib/comps/IndicatorGraphicsCard.svelte';
	import SmallGreedIndicatorCard from '$lib/comps/SmallGreedIndicatorCard.svelte';
	import CoinSwiper from '$lib/comps/CoinSwiper.svelte';
	import PaidPlanBadge from '$lib/comps/decorations/PaidPlanBadge.svelte';
	import FreeCard from '$lib/comps/plan-cards/FreeCard.svelte';
	import MemeSwiper from '$lib/comps/MemeSwiper.svelte';
	import HomepageBigChart from '$lib/comps/HomepageBigChart.svelte';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import SmallCharts from '$lib/comps/SmallCharts.svelte';
	import HomepageBtcDominanceFloating from '$lib/comps/homepage/HomepageBtcDominanceFloating.svelte';
	import Footer from '$lib/comps/Footer.svelte';
	import GetFreeTrialOverlay from '$lib/comps/overlays/GetFreeTrialOverlay.svelte';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import PaidPlanCard from '$lib/comps/plan-cards/PaidPlanCard.svelte';
	import { planInfoPlus, planInfoPro } from '$ts/utils/client/plans';
	import {
		enableXmas,
		getDesktopHomepageTopBgUrl,
		getMobileBnbCoinUrl,
		getMobileBtcCoinUrl,
		getMobileHomepageTopBgUrl,
		getMobileSolCoinUrl
	} from '$ts/utils/client/ui';

	const selectedSymbol = writable<string>('BTC');

	selectedSymbol.subscribe((symbol) => {
		if (!browser) {
			return;
		}

		console.log({ symbol });

		if (!$coinstats_coin_list) {
			return;
		}

		const coin = $coinstats_coin_list.find((c) => c.symbol === symbol);

		if (coin) {
			console.log('set ', coin);
			coinstats_selected_coin.set(coin);
		}
	});

	let showGetFreeTrial = false;
</script>

<main class="w-full relative overflow-clip">
	<!-- Mobile top bg image -->
	<div
		style="background-image: url({getMobileHomepageTopBgUrl()});"
		class="desktop:hidden absolute w-full bg-bottom -z-20 bg-no-repeat bg-cover h-[120vh]"
	></div>

	<!-- Mobile top glow -->
	<div
		class="desktop:hidden absolute -z-10 bg-[url(/background/mobile/homepage-top-gradient.svg)] w-full h-[500px] bg-no-repeat bg-center -translate-y-20"
	></div>

	<!-- Mobile bnb coin -->
	<div
		style="background-image: url({getMobileBnbCoinUrl()});"
		class="desktop:hidden w-[94px] h-[94px] absolute left-0 top-20 bg-contain"
	></div>

	<!-- Mobile ether coin -->
	<div
		class="desktop:hidden bg-[url(/images/mobile/eth-coin-bg.svg)] w-[94px] h-[94px] absolute -right-6 top-[600px] -z-10"
	></div>

	<div class="h-full max-w-[980px] mx-auto desktop:min-h-screen px-4 flex flex-col justify-center">
		<div
			style="background-image: url({getDesktopHomepageTopBgUrl()});"
			class="-desktop:hidden bg-cover bg-center min-h-screen w-screen absolute top-0 left-0 -z-10"
		></div>

		{#if enableXmas}
			<div
				style="background-image: url(/images/xmas/snowflake.blur.png)"
				class="absolute -left-12 top-[15vh] w-40 aspect-square -desktop:hidden"
			></div>

			<div
				style="background-image: url(/images/xmas/ball.png); aspect-ratio: 256/396;"
				class="w-36 absolute bg-cover bg-center right-0 top-0 translate-y-[60vh] brightness-[0.6]"
			></div>
		{/if}

		<h1 class="text-5xl text-center font-paralucent-demibold -sm:text-[36px] mx-10 -desktop:mt-24">
			<span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#F3C111]">
				Calculate
			</span>{' '}
			Your&nbsp;Trading
		</h1>

		<h2 class="opacity-80 text-center mt-[10px] font-bold text-lg -sm:text-sm mx-10">
			Toolset for effortlessly navigating the emotional rollercoaster that is crypto.
		</h2>

		<!-- Main card with chart -->
		<div
			style="background: linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0.2) 125.15%) padding-box, linear-gradient(179.91deg, rgba(255, 59, 16, 0.4) 11.58%, rgba(255, 59, 16, 0) 99.92%) border-box"
			class="relative bg-gradient-to-b from-black to-[#00000033] w-full desktop:h-[550px] mt-[25px] rounded-[28px] pt-[46px] flex flex-col border-2 border-transparent pb-[20px]"
		>
			{#if showGetFreeTrial}
				<GetFreeTrialOverlay hideCb={() => (showGetFreeTrial = false)} />
			{/if}

			<!-- Xmas decorations -->
			{#if enableXmas}
				<div
					style="background-image: url(/images/xmas/lights-left.png);"
					class="w-72 -desktop:w-48 absolute bg-cover left-0 aspect-[1.568] bg-center top-0 -translate-x-12 -desktop:-translate-x-8 -translate-y-16 -desktop:-translate-y-10"
				></div>

				<div
					style="background-image: url(/images/xmas/lights-right.png);"
					class="w-96 -desktop:w-[17rem] absolute bg-cover right-0 aspect-[1.865] bg-center top-0 translate-x-24 -desktop:translate-x-20 -translate-y-20 -desktop:-translate-y-14"
				></div>

				<div
					style="background-image: url(/images/xmas/star.png);"
					class="w-24 absolute bg-cover right-0 aspect-square bg-center top-0 translate-y-24 translate-x-12 -desktop:hidden"
				></div>

				<div
					style="background-image: url(/images/xmas/wreath.png); aspect-ratio: 86/94;"
					class="w-20 absolute bg-cover left-0 bg-center bottom-0 -translate-y-16 -translate-x-16 -desktop:hidden"
				></div>
			{/if}

			<!-- Mobile btc coin -->
			<div
				style="background-image: url({getMobileBtcCoinUrl()});"
				class="desktop:hidden w-[94px] h-[94px] absolute -right-6 -top-10 z-20 bg-cover"
			></div>

			<!-- Mobile sol coin -->
			<div
				style="background-image: url({getMobileSolCoinUrl()});"
				class="desktop:hidden w-[94px] h-[94px] absolute -left-4 bottom-20 z-20 bg-contain"
			></div>

			<SmallCharts />

			<div class="flex desktop:pr-[25px] flex-grow">
				<div class="flex-grow flex-shrink pt-[66px] relative overflow-hidden">
					<div
						class="desktop:w-[600px] -desktop:pb-24 -desktop:w-full h-full overflow-hidden pl-[30px] desktop:pr-4 -desktop:px-2 desktop:pb-24"
					>
						<HomepageBigChart />
					</div>

					<HomepageCoinSwitcher
						on:get-free-trial={() => (showGetFreeTrial = true)}
						bind:selectedTicker={$selectedSymbol}
					></HomepageCoinSwitcher>
				</div>

				<div class="pt-[24px] w-[320px] relative flex-shrink-0 -desktop:hidden">
					<div class="absolute h-[430px]">
						<IndicatorCard onHomepage />
					</div>

					{#if showGetFreeTrial}
						<div
							in:fade={{ duration: 100 }}
							class="absolute h-[42px] bg-[#0F0F0F99] -bottom-[62px] backdrop-blur-sm inset-x-[2px] rounded-b-[28px]"
						></div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="desktop:hidden px-4 mt-4 h-[450px]">
		<IndicatorCard />
	</div>

	<div
		class="max-w-screen-xl mx-auto desktop:pt-[260px] -desktop:pt-[50px] min-h-[800px] relative -z-10 px-4"
	>
		<div class="absolute top-0 -translate-y-40 -desktop:scale-[2.5] -desktop:translate-y-[200px]">
			<img
				src="/background/homepage-2.svg"
				width={1158}
				height={919}
				alt=""
				class="relative -z-10"
			/>
		</div>

		<div class="relative z-0">
			<div class="-desktop:text-center desktop:max-w-[570px] -1120:max-w-[430px] -desktop:mx-auto">
				<h2
					class="text-[64px] -desktop:text-[36px] -desktop:leading-[42px] leading-[75px] font-paralucent-demibold"
				>
					Stop Trading With <br />
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow">
						Emotions
					</span>
				</h2>

				<p class="font-bold text-lg pt-[25px] opacity-80 -desktop:text-sm">
					Fomoed provides a toolset for effortlessly navigating the emotional rollercoaster that is
					crypto.
					<br /> <br />
					Have complete access to your favorite Altcoins and get precise data-based market sentiment
					analysis
				</p>
			</div>

			<!-- Mobile cards -->
			<div class="desktop:hidden mt-4">
				<div class="flex flex-col">
					<div class="translate-x-6 flex justify-end scale-75">
						<SmallGreedIndicatorCard percentage={$cfgi_summary?.now.value} />
					</div>
					<div><VideoContainer thumbnail="/images/video-thumbnail.png" /></div>

					<div class="flex mt-3 h-[120px]">
						<div class="w-1/2 -translate-x-2"><HomepageBtcDominanceFloating /></div>
						<div class="flex-grow"></div>
						<div class="scale-[0.6] origin-top-right -translate-y-12 translate-x-2">
							<IndicatorGraphicsCard percentage={80} />
						</div>
					</div>
				</div>
			</div>

			<!-- Desktop cards -->
			<div class="-desktop:hidden w-[509px] h-[373px] absolute top-0 right-0">
				<VideoContainer thumbnail="/images/video-thumbnail.png" />
			</div>

			<div class="-desktop:hidden absolute top-0 right-0 translate-x-10 -translate-y-[70%]">
				<IndicatorGraphicsCard percentage={80} />
			</div>

			<div class="-desktop:hidden absolute left-1/2 top-0 -translate-y-[130%]">
				<SmallGreedIndicatorCard percentage={$cfgi_summary?.now.value} />
			</div>

			<div
				class="-desktop:hidden absolute left-1/2 bottom-0 translate-y-[105%] w-[245px] h-[144px]"
			>
				<HomepageBtcDominanceFloating />
			</div>
		</div>
	</div>

	<CoinSwiper />

	<div>
		<div>
			<h2 class="text-[36px] text-center font-paralucent-demibold -desktop:text-[22px]">
				Get your free trial to unlock more!
			</h2>

			<div class="flex mx-auto max-w-max gap-x-[20px] pt-[9px]">
				<img src="/fomoed.svg" class="-desktop:w-[125px]" width={158} height={33} alt="Fomoed." />

				<PaidPlanBadge />
			</div>
		</div>
	</div>
	<div
		class="pt-[52px] -desktop:pt-8 flex justify-center gap-x-[14px] items-center px-4 -desktop:flex-col gap-y-4"
	>
		<FreeCard />

		{#if $planInfoPro}
			<PaidPlanCard
				planInfo={$planInfoPro}
				yearlySelected={false}
				on:click-free-trial={() => goto('/plans')}
				on:click-subscribe={() => goto('/plans')}
				on:click-unsubscribe={() => goto('/plans')}
				on:click-resubscribe={() => goto('/plans')}
			/>
		{/if}

		{#if $planInfoPlus}
			<PaidPlanCard
				planInfo={$planInfoPlus}
				yearlySelected={false}
				on:click-free-trial={() => goto('/plans')}
				on:click-subscribe={() => goto('/plans')}
				on:click-unsubscribe={() => goto('/plans')}
				on:click-resubscribe={() => goto('/plans')}
			/>
		{/if}
	</div>

	<div
		class="max-w-[914px] mx-auto flex -desktop:flex-col items-center gap-x-[80px] pt-40 -desktop:pt-8 relative -desktop:pb-16 pb-48 px-4 -desktop:scale-90"
	>
		<div
			class="absolute inset-x-0 -desktop:bottom-0 desktop:-translate-y-40 translate-x-1/3 -z-10 scale-150 -desktop:scale-[2]"
		>
			<img src="/background/homepage-3.svg" width={1040} height={2352} alt="" />
		</div>

		<MemeSwiper />

		<div class="-desktop mt-32">
			<div
				class="text-[36px] -desktop:text-[24px] leading-[45px] font-paralucent-demibold -desktop:text-center"
			>
				Got any trouble or question?
			</div>
			<div class="pt-[15px] text-[20px] -desktop:text-sm font-semibold">
				Send us your thought to{' '}
				<a id="contact" href="mailto:support@fomoed.io" class="text-primary underline">
					support@fomoed.io
				</a>
			</div>
		</div>
	</div>

	<Footer />
</main>
