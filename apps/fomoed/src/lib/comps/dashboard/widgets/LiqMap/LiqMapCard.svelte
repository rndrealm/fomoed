<script lang="ts">
	import { coinstats_selected_coin } from '$lib/stores';
	import { ClientSubscriptionManager } from '$ts/utils/client/plans';
	import PlanRequiredOverlay from '$lib/comps/overlays/PlanRequiredOverlay.svelte';
	import BaseLiqMapChart from '../_BaseLiqMap/BaseLiqMapChart.svelte';
	import DashboardCard from '$lib/comps/DashboardCard.svelte';
	import Autocomplete from '$lib/comps/Autocomplete.svelte';
	import DropdownNew from '$lib/comps/DropdownNew.svelte';
	import { getContext } from 'svelte';
	import IconRefresh from '$lib/icons/IconRefresh.svelte';
	import IconButton from '$lib/comps/buttons/IconButton.svelte';
	import { writable, type Readable } from 'svelte/store';
	import { browser } from '$app/environment';
	import {
		fetchLiqMapData,
		getSupportedLiqMapInstrumentOptions,
		type InstrumentOption,
		type LiqMapData
	} from '$lib/comps/charts/chartUtils';
	import DashboardCardTitle from '$lib/comps/DashboardCardTitle.svelte';
	import DashboardCardHeader from '$lib/comps/DashboardCardHeader.svelte';
	import InCardChartContainer from '$lib/comps/InCardChartContainer.svelte';
	import { logged_in } from '$lib/stores/user';
	import { type Chart } from 'chart.js';
	import Legend from '$lib/comps/charts/Legend.svelte';

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

	let assetOptions: Option[] = [];
	let selAssetOption = writable<InstrumentOption | null>(null);

	let loading: boolean;
	let currentPrice: number;
	let data: LiqMapData | null = null;

	const pairSearchTerm = writable($selAssetOption?.label || '');

	async function loadAssetOptions() {
		assetOptions = await getSupportedLiqMapInstrumentOptions();

		if (!assetOptions.length) {
			selAssetOption.set(null);
			return;
		}

		selAssetOption.set(assetOptions[0]);
		pairSearchTerm.set(assetOptions[0].label);
	}

	coinstats_selected_coin.subscribe(() => {
		browser && $logged_in && loadAssetOptions();
	});

	async function refreshData() {
		loading = true;

		if (!$selAssetOption) {
			return null;
		}

		try {
			data = await fetchLiqMapData(selectedTimeframe.value, [$selAssetOption.value]);
		} catch (ex) {
			console.error(ex);
		}

		loading = false;
	}

	$: $selAssetOption && refreshData();
</script>

<div class="h-full overflow-hidden relative">
	<DashboardCard isChartCard {hideCard}>
		{#if !$enablePlusFeatures}
			<div class="absolute inset-px">
				<PlanRequiredOverlay planId="pro" />
			</div>
		{/if}

		<div class="flex flex-col w-full h-full max-w-full overflow-hidden">
			<DashboardCardHeader>
				<DashboardCardTitle
					title={`${$selAssetOption?.value.baseAsset || $coinstats_selected_coin?.symbol}/${$selAssetOption?.value.quoteAsset || 'USDT'}`}
					subtitle="Liquidation Map"
				/>

				<div class="col-span-2 -desktop:order-3 flex gap-x-2">
					<div class="w-40 z-10 -desktop:flex-grow desktop:w-56 h-14">
						<Autocomplete
							options={assetOptions}
							bind:inputValue={$pairSearchTerm}
							bind:selected={$selAssetOption}
						/>
					</div>

					<div class="w-32 z-10">
						<DropdownNew
							options={timeframeOptions}
							bind:selected={selectedTimeframe}
							on:change={async () => {
								refreshData?.();
							}}
						/>
					</div>
				</div>

				<div
					class="-desktop:order-2 place-self-end duration-200 {$isFullscreenCardStore && 'pr-10'}"
				>
					<IconButton disabled={loading} on:click={refreshData}>
						<div class:animate-reverse-spin={loading}>
							<IconRefresh />
						</div>
					</IconButton>
				</div>
			</DashboardCardHeader>

			<!-- Legend and Chart -->
			<div class="flex-grow h-full flex flex-col max-w-full overflow-hidden">
				<div class="flex-grow-0 mt-4 -desktop:mt-6 px-[30px] -desktop:px-4">
					<Legend
						legends={[
							{ color: '#21AA94', label: 'Cumulative Short Liquidation Leverage' },
							{ color: '#F23645', label: 'Cumulative Long Liquidation Leverage' },
							{ color: '#FF8300', label: '100x Leverage' },
							{ color: '#FFC403', label: '50x Leverage' },
							{ color: '#73D8DA', label: '25x Leverage' },
							{ color: '#6EC2F0', label: '10x Leverage' }
						]}
					></Legend>
				</div>

				<!-- <div class="text-sm text-center pt-1 -desktop:text-xs">
					Current Price: {currentPrice}
				</div> -->

				{#if $enablePlusFeatures}
					<InCardChartContainer {loading}>
						{#if $selAssetOption}
							<BaseLiqMapChart bind:chart bind:currentPrice {data} />
						{/if}
					</InCardChartContainer>
				{/if}
			</div>
		</div>
	</DashboardCard>
</div>
