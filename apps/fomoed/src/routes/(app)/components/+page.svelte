<script lang="ts">
	import LiqHeatmapCard from '$lib/comps/dashboard/widgets/LiqHeatmap/LiqHeatmapCard.svelte';
	import NewsFilterDropdown from '$lib/comps/dropdowns/NewsFilterDropdown.svelte';
	import NewsKindDropdown from '$lib/comps/dropdowns/NewsKindDropdown.svelte';
	import LoadUserData from '$lib/comps/func/LoadUserData.svelte';
	import BaseSearch from '$lib/comps/search/BaseSearch.svelte';
	import { active_sub } from '$lib/stores/subs';
	import { auth_email, auth_user } from '$lib/stores/user';
	import { newsFilterOpts, newsKindOpts } from '$ts/client/services/NewsServiceOld.client';
	import { availablePlans, ClientSubscriptionManager } from '$ts/utils/client/plans';

	const enablePlusFeatures = ClientSubscriptionManager.enableProFeatures;

	let newsFilterSelected = $state(newsFilterOpts[0]);
	let newsKindSelected = $state(newsKindOpts[0]);
	let searchValue = $state('');

	let chart: any;

	$inspect($auth_email);
	$inspect($auth_user?.subscriptions, 'subs');
	$inspect($enablePlusFeatures, 'enablePlusFeatures');
	$inspect($availablePlans, 'availablePlans');
	$inspect($active_sub, 'active_sub');
</script>

<LoadUserData />

<div class="max-w-prose mx-auto pt-8 grid gap-y-2">
	<div class="w-40">
		<NewsFilterDropdown bind:selected={newsFilterSelected} />
	</div>

	<div class="w-40">
		<NewsKindDropdown bind:selected={newsKindSelected} />
	</div>

	<div class="w-40">
		<BaseSearch bind:value={searchValue} />
	</div>

	<div class="w-[1000px] h-[700px]">
		<LiqHeatmapCard bind:chart />
	</div>
</div>
