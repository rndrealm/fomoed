<script lang="ts">
	import CignalsChartSettingsPopup from '$lib/comps/popups/CignalsChartSettingsPopup.svelte';
	import type { CignalsChartOptions, ParsedCignalsInstrumentArray } from '$lib/types';
	import type { SocketStatus } from '$ts/types';
	import { capitalize } from 'lodash-es';
	import { CignalsChart } from './cignalsChart';
	import { CignalsChartDataProviderAPI } from './cignalsChartDataProvider';
	import { mount, onDestroy, unmount } from 'svelte';
	import AdjustmentHorizontal from '$lib/icons/AdjustmentHorizontal.svelte';

	let props: { isFullscreen: boolean } = $props();

	let canvas: HTMLCanvasElement | null = $state(null);

	let dataProvider = new CignalsChartDataProviderAPI();
	let chart: CignalsChart | null = null;
	let availableInstruments: ParsedCignalsInstrumentArray = $state([]);

	$effect(() => {
		if (!canvas) return;

		const provider = new CignalsChartDataProviderAPI();

		chart = new CignalsChart({
			canvas,
			dataProvider: provider,
			onSocketConnecting: onSocketConnecting,
			onSocketDisconnected: onSocketDisconnected,
			onSocketConnected: onSocketConnected
		});
		chart.autoAdjustDatapointWidth();
		chart.refreshData();
		chartOptions = chart.options;

		refreshAvailableInstruments();
	});

	onDestroy(() => {
		chart?.destroy();
	});

	async function refreshAvailableInstruments() {
		availableInstruments = await dataProvider.fetchInstruments();
	}

	function onSave(newOptions: CignalsChartOptions) {
		if (!chart) {
			throw new Error('Chart not initialized');
		}

		if (!chartOptions) {
			throw new Error('Chart options are null');
		}

		chart.options = newOptions;
		chartOptions = chart.options;

		onPopupClose();
	}

	let chartOptions: CignalsChartOptions | null = $state(null);

	let settingsPopupComponent: CignalsChartSettingsPopup | null = null;

	function openPopup() {
		chartOptions = chart!.options;

		settingsPopupComponent = mount(CignalsChartSettingsPopup, {
			target: document.body,
			props: {
				origOptions: chartOptions,
				onSave,
				onCancel: onPopupClose,
				availableInstruments
			}
		});
	}

	onDestroy(() => {
		onPopupClose();
	});

	$inspect(settingsPopupComponent);

	function onPopupClose() {
		if (!settingsPopupComponent) {
			console.log('return');
			return;
		}

		unmount(settingsPopupComponent);
		settingsPopupComponent = null;
	}

	let selectedInstrument = $derived(
		availableInstruments.find((i) => i.id === chartOptions?.instrument.id) || null
	);

	$inspect(selectedInstrument);

	let selectedInstrumentTitle = $derived(
		selectedInstrument
			? (selectedInstrument?.base_currency + '/' + selectedInstrument?.quote_currency).toUpperCase()
			: null
	);

	// Socket status handlers
	let socketStatus: SocketStatus = $state('disconnected');

	function onSocketConnecting() {
		socketStatus = 'connecting';
	}

	function onSocketConnected() {
		socketStatus = 'connected';
	}

	function onSocketDisconnected() {
		socketStatus = 'disconnected';
	}
</script>

<div class="w-full h-full relative">
	<canvas class="absolute w-full h-full touch-none" bind:this={canvas}> </canvas>

	<!-- Toolbar -->
	<div
		class="absolute inset-x-0 top-0 px-2 py-2 flex gap-x-3 items-center bg-black/20 backdrop-blur-md"
	>
		<!-- Settings button -->
		<button
			onclick={openPopup}
			class="rounded-xl border border-white border-opacity-30 p-2 hover:bg-white/10 duration-100 active:brightness-50"
		>
			<div class="w-6 h-6">
				<AdjustmentHorizontal />
			</div>
		</button>

		<!-- Instrument info -->
		<div>
			{#if chartOptions}
				<div class="font-semibold">{selectedInstrumentTitle}</div>
			{/if}
		</div>

		<div class="flex-grow"></div>

		<!-- Socket status -->
		<div
			class="text-white font-semibold text-xs duration-200 {props.isFullscreen
				? 'pr-[4.5rem]'
				: 'pr-4'}"
			class:_connecting={socketStatus === 'connecting'}
			class:_connected={socketStatus === 'connected'}
			class:_disconnected={socketStatus === 'disconnected'}
		>
			{capitalize(socketStatus)}
		</div>
	</div>
</div>

<style>
	._connected {
		color: #00ff00;
	}

	._connecting {
		color: #ffff00;
	}

	._disconnected {
		color: #ff0000;
	}
</style>
