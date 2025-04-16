<script lang="ts">
	import AppNav from '$lib/comps/AppNav.svelte';
	import NewsCardContent from '$lib/comps/dashboard/NewsCardContent.svelte';
	import { setContext } from 'svelte';
	import { innerHeight } from '$lib/stores/ui';
	import { NewsService as NewsServiceOld } from '$ts/client/services/NewsServiceOld.client';

	let scrollY = 0;

	setContext('newsService', new NewsServiceOld());
</script>

<svelte:window bind:scrollY />

<div
	class="bg-[url(/background/dashboard.svg)] inset-0 fixed min-h-screen bg-cover -z-10 brightness-75"
></div>

{#snippet newsTitle()}
	<div
		class="font-semibold font-paralucent-heavy flex items-end translate-y-px text-4xl -desktop:hidden"
	>
		News
	</div>
{/snippet}

<div
	class="fixed top-0 w-full z-40 -desktop:bg-[50%_50%]"
	style="backdrop-filter: brightness({1 - Math.min(0.7, scrollY / 100)}) blur(16px);"
>
	<AppNav title={newsTitle} showDashboardLink class="" />
</div>

<div class="pt-[75px] overflow-hidden mx-2" style="height: {$innerHeight}px;">
	<div class="font-semibold font-paralucent-heavy flex items-end text-4xl pl-3 pb-2 desktop:hidden">
		News
	</div>

	<NewsCardContent
		alwaysShowFilters
		autoListWrapperHeight
		disableGradientEdges
		hideTitle
		disableFly
		class="desktop:!px-0 -desktop:!px-2 !pb-0"
		--max-list-width="1050px"
		--max-filters-width="1050px"
	/>
</div>
