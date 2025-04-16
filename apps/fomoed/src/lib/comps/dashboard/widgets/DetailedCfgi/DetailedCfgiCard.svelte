<script lang="ts">
	import DashboardCard from '$lib/comps/DashboardCard.svelte';
	import DashboardCardTitle from '$lib/comps/DashboardCardTitle.svelte';
	import DurationSwitcher from '$lib/comps/DurationSwitcher.svelte';
	import HomepageBigChart from '$lib/comps/HomepageBigChart.svelte';
	import InCardChartContainer from '$lib/comps/InCardChartContainer.svelte';
	import GetFreeTrialOverlay from '$lib/comps/overlays/GetFreeTrialOverlay.svelte';
	import { coinstats_selected_coin } from '$lib/stores';
	import { isDesktop } from '$lib/stores/ui';
	import { CfgiPeriods, type CfgiPeriodOption } from '$lib/utils/cfgi_data';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const isFullscreenCardStore: Readable<boolean> = getContext('isFullscreenCardStore');

	export let hideCard = false;
	export let chart: any;

	let showSubRequired = false;
	let loading: boolean;

	const colorToCfgi = {
		25: '#FF3B10',
		50: '#EA9924',
		75: '#399F57',
		100: '#05A5A6'
	};

	let selectedPeriodOption: CfgiPeriodOption = CfgiPeriods[0];
</script>

<DashboardCard isChartCard {hideCard}>
	{#if showSubRequired}
		<div class="absolute inset-px">
			<GetFreeTrialOverlay hideCb={() => (showSubRequired = false)} />
		</div>
	{/if}

	<div class="w-full h-full flex flex-col overflow-hidden desktop:px-[30px]">
		<div class="desktop:flex items-center w-full -desktop:px-4">
			<DashboardCardTitle
				title={$coinstats_selected_coin?.name || 'Bitcoin'}
				subtitle="Crypto Fear and Greed Chart"
			></DashboardCardTitle>

			<div class="flex-grow"></div>

			<div class="-desktop:mt-3 {$isFullscreenCardStore && $isDesktop ? 'pr-12' : ''}">
				<DurationSwitcher
					bind:selected={selectedPeriodOption}
					on:show-subscription-required={() => (showSubRequired = true)}
				></DurationSwitcher>
			</div>
		</div>

		<div class="flex gap-x-4 justify-center font-paralucent font-light">
			{#each Object.entries(colorToCfgi) as [cfgi, color], index}
				<div class="flex items-center mt-2">
					<div class="w-2 h-2 rounded-full" style="background-color: {color}"></div>
					<div class="ml-2 text-[#A0A0A0] text-sm">{index * 25}-{(index + 1) * 25}</div>
				</div>
			{/each}
		</div>

		<div class="pt-4 flex-grow">
			<InCardChartContainer {loading}>
				<HomepageBigChart
					bind:chart
					bind:loading
					periodHasSeconds={selectedPeriodOption.periodInSeconds}
				></HomepageBigChart>
			</InCardChartContainer>
		</div>
	</div>
</DashboardCard>
