<script lang="ts">
	import { coinstats_selected_coin } from '$lib/stores';
	import { ClientSubscriptionManager } from '$ts/utils/client/plans';
	import PlanRequiredOverlay from '$lib/comps/overlays/PlanRequiredOverlay.svelte';
	import DashboardCard from '$lib/comps/DashboardCard.svelte';
	import DropdownNew from '$lib/comps/DropdownNew.svelte';
	import { getContext, tick } from 'svelte';
	import IconRefresh from '$lib/icons/IconRefresh.svelte';
	import IconButton from '$lib/comps/buttons/IconButton.svelte';
	import Legend from '$lib/comps/charts/Legend.svelte';
	import BaseLiqMapChart from '../_BaseLiqMap/BaseLiqMapChart.svelte';
	import { fetchLiqMapDataMerged, type LiqMapData } from '$lib/comps/charts/chartUtils';
	import DashboardCardTitle from '$lib/comps/DashboardCardTitle.svelte';
	import DashboardCardHeader from '$lib/comps/DashboardCardHeader.svelte';
	import InCardChartContainer from '$lib/comps/InCardChartContainer.svelte';
	import type { Chart } from 'chart.js';
	import type { Readable } from 'svelte/store';

	const isFullscreenCardStore: Readable<boolean> = getContext('isFullscreenCardStore');

	export let hideCard = false;
	export let chart: Chart;

	const enablePlusFeatures = ClientSubscriptionManager.enableProFeatures;

	type Option = { label: string; value: any };

	const timeframeOptions: Option[] = [
		{ label: '1 day', value: '1d' },
		{ label: '7 days', value: '7d' }
	];

	let selectedTimeframe: Option = timeframeOptions[0];

	let loading: boolean;
	let currentPrice: number;
	let data: LiqMapData | null = null;

	async function refreshData() {
		loading = true;

		await tick();

		try {
			data = await fetchLiqMapDataMerged(selectedTimeframe.value, $coinstats_selected_coin.symbol);
		} catch (ex) {
			console.error(ex);
		} finally {
			loading = false;
		}
	}

	$: $coinstats_selected_coin && refreshData();
</script>

<div class="h-full w-full overflow-hidden relative">
	<DashboardCard isChartCard {hideCard}>
		{#if !$enablePlusFeatures}
			<div class="absolute inset-px">
				<PlanRequiredOverlay planId="pro" />
			</div>
		{/if}

		<div class="flex flex-col w-full h-full max-w-full overflow-hidden">
			<DashboardCardHeader>
				<DashboardCardTitle
					title={$coinstats_selected_coin?.name.toUpperCase()}
					subtitle="Exchange Liquidation Map"
				/>

				<div class="-desktop:mt-2 flex gap-x-1 place-self-end">
					<div class="z-10">
						<DropdownNew
							options={timeframeOptions}
							bind:selected={selectedTimeframe}
							on:change={async () => {
								refreshData();
							}}
						/>
					</div>

					<div class="-desktop:flex-grow"></div>

					<div class:pr-10={$isFullscreenCardStore}>
						<IconButton disabled={loading} on:click={refreshData}>
							<div class:animate-reverse-spin={loading}>
								<IconRefresh />
							</div>
						</IconButton>
					</div>
				</div>
			</DashboardCardHeader>

			<!-- Legend and Chart -->
			<div class="flex-grow h-full flex flex-col">
				<div class="flex-grow-0 mt-4 -desktop:mt-6 px-[30px] -desktop:px-4">
					<Legend
						legends={[
							{ color: '#21AA94', label: 'Cumulative Short Liquidation Leverage' },
							{ color: '#F23645', label: 'Cumulative Long Liquidation Leverage' },
							{ color: '#FF8300', label: 'Binance' },
							{ color: '#FFC403', label: 'OKX' },
							{ color: '#73D8DA', label: 'Bybit' }
						]}
					></Legend>
				</div>

				<!-- <div class="text-sm text-center pt-1 -desktop:text-xs">
					Current Price: {currentPrice}
				</div> -->

				{#if $enablePlusFeatures}
					<InCardChartContainer {loading}>
						<BaseLiqMapChart bind:chart bind:currentPrice {data} />
					</InCardChartContainer>
				{/if}
			</div>
		</div>
	</DashboardCard>
</div>
