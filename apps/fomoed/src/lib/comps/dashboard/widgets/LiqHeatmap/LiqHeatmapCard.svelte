<script lang="ts">
	import Autocomplete from '$lib/comps/Autocomplete.svelte';
	import DropdownNew from '$lib/comps/DropdownNew.svelte';
	import { getContext, tick } from 'svelte';
	import { supportedExchangePairsToOptions, type InstrumentInfo } from '$ts/utils/client';
	import IconRefresh from '$lib/icons/IconRefresh.svelte';
	import IconButton from '$lib/comps/buttons/IconButton.svelte';
	import { getCacheOrFetchSupportedExchangePairs } from '$ts/utils/client/api';
	import { writable, type Readable } from 'svelte/store';
	import LiqHeatmapChart from './LiqHeatmapChart.svelte';
	import Legend from '$lib/comps/charts/Legend.svelte';
	import DashboardCard from '$lib/comps/DashboardCard.svelte';
	import PlanRequiredOverlay from '$lib/comps/overlays/PlanRequiredOverlay.svelte';
	import { ClientSubscriptionManager } from '$ts/utils/client/plans';
	import { coinstats_selected_coin } from '$lib/stores';
	import InCardChartContainer from '$lib/comps/InCardChartContainer.svelte';
	import DashboardCardTitle from '$lib/comps/DashboardCardTitle.svelte';
	import DashboardCardHeader from '$lib/comps/DashboardCardHeader.svelte';
	import { browser } from '$app/environment';
	import { auth_user } from '$lib/stores/user';

	const isFullscreenCardStore: Readable<boolean> = getContext('isFullscreenCardStore');

	export let hideCard = false;
	export let chart: any;

	let symbol = $coinstats_selected_coin?.symbol || 'BTC';

	const enablePlusFeatures = ClientSubscriptionManager.enableProFeatures;

	type Option = { label: string; value: string };

	const timeframeOptions: Option[] = [
		{ label: '12 hours', value: '12h' },
		{ label: '24 hours', value: '24h' },
		{ label: '3 days', value: '3d' },
		{ label: '1 week', value: '7d' },
		{ label: '1 month', value: '30d' },
		{ label: '3 months', value: '90d' },
		{ label: '6 months', value: '180d' },
		{ label: '1 year', value: '1y' }
	];

	let selectedTimeframe: Option = timeframeOptions[0];

	type ExchangeOption = { label: string; value: InstrumentInfo };

	let exchangeOptions: ExchangeOption[] = [];
	let selectedExchangeOption = writable<ExchangeOption | null>(null);

	async function loadExchangeOptions() {
		const suppExchangePairs = await getCacheOrFetchSupportedExchangePairs();
		const options = supportedExchangePairsToOptions(suppExchangePairs);

		// Filter by selected coin
		const filtered = options.filter((o) => o.value.baseAsset === symbol);

		exchangeOptions = filtered;

		if (filtered.length < 1) {
			console.error('No exchange options found for', symbol);

			selectedExchangeOption.set(null);
			return;
		}

		selectedExchangeOption.set(filtered[0]);
		pairSearchTerm.set(filtered[0].label);
	}

	let refreshData: () => any;
	let loading: boolean = true;

	const pairSearchTerm = writable($selectedExchangeOption?.label || '');

	$: if ($selectedExchangeOption && selectedTimeframe) {
		refreshData();
	}

	$: browser && $auth_user && symbol && loadExchangeOptions();

	$: title =
		($selectedExchangeOption?.value.baseAsset || $coinstats_selected_coin?.symbol) +
		'/' +
		($selectedExchangeOption?.value.quoteAsset || 'USDT');
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
				<DashboardCardTitle {title} subtitle="Liquidation Heatmap"></DashboardCardTitle>

				<div class="col-span-2 -desktop:order-3 flex gap-x-2">
					<div class="desktop:w-56 z-10 -desktop:w-32 h-14 -desktop:order-3 -desktop:flex-grow">
						<Autocomplete
							options={exchangeOptions}
							bind:inputValue={$pairSearchTerm}
							bind:selected={$selectedExchangeOption}
						/>
					</div>

					<div class="w-32 z-10 h-14 -desktop:order-4">
						<DropdownNew
							options={timeframeOptions}
							bind:selected={selectedTimeframe}
							on:change={async () => {
								await tick();
								refreshData();
							}}
						/>
					</div>
				</div>

				<div class="-desktop:order-2 place-self-end {$isFullscreenCardStore && 'pr-10'}">
					<IconButton disabled={loading} on:click={refreshData}>
						<div class:animate-reverse-spin={loading}>
							<IconRefresh />
						</div>
					</IconButton>
				</div>
			</DashboardCardHeader>

			<div class="px-[30px] -desktop:px-4 pb-3 pt-3 desktop:pl-32">
				<Legend
					legends={[
						{ color: '#440253', label: 'Liquidation Leverage' },
						{ color: '#0DCB81', label: 'Supercharts' }
					]}
				></Legend>
			</div>

			<div class="flex-grow gap-x-4 pl-5">
				<InCardChartContainer {loading}>
					<LiqHeatmapChart
						bind:chart
						bind:refreshData
						bind:loading
						timeframe={selectedTimeframe.value}
						exchange={$selectedExchangeOption?.value.exchange}
						symbol={$selectedExchangeOption?.value.instrumentId}
					/>
				</InCardChartContainer>
			</div>
		</div>
	</DashboardCard>
</div>
