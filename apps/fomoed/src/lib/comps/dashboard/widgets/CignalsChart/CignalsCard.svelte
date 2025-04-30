<script lang="ts">
	import DashboardCard from '$lib/comps/DashboardCard.svelte';
	import type { DashboardWidgetProps } from '$lib/comps/dashboard/widgets';
	import PlanRequiredOverlay from '$lib/comps/overlays/PlanRequiredOverlay.svelte';
	import { ClientSubscriptionManager } from '$ts/utils/client/plans';
	import CignalsChart from './CignalsChart.svelte';

	let { isFullscreen }: DashboardWidgetProps = $props();

	const enablePlusFeatures = ClientSubscriptionManager.enableProFeatures;
</script>

<div class="h-full w-full overflow-hidden relative">
	<DashboardCard isChartCard disablePadding>
		{#if !$enablePlusFeatures}
			<div class="absolute inset-px">
				<PlanRequiredOverlay planId="pro" />
			</div>
		{/if}

		<CignalsChart {isFullscreen} />
	</DashboardCard>
</div>
