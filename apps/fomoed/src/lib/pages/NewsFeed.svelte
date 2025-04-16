<script lang="ts">
	import LatestNewsSection from '$lib/comps/LatestNewsSection/LatestNewsSection.svelte';
	import NewsAssetPriceRow from '$lib/comps/NewsAssetPriceRow/NewsAssetPriceRow.svelte';
	import TopFeaturedStorySection from '$lib/comps/TopFeaturedStorySection/TopFeaturedStorySection.svelte';
	import { newsService } from '$ts/client/services/NewsService.client.svelte';
	import { onMount } from 'svelte';
	import CfgiWidget from '$lib/comps/CfgiWidget/CfgiWidget.svelte';
	import PopularNewsWidget from '$lib/comps/PopularNewsWidget/PopularNewsWidget.svelte';
	import { DESKTOP_BREAKPOINT, innerWidth } from '$lib/stores/ui';
	import toast from 'svelte-5-french-toast';

	onMount(async () => {
		if (newsService.news.length > 0) {
			return;
		}

		newsService.fetchNews();
		newsService.fetchPopularNews().then((ok) => {
			if (!ok) {
				toast.error('Failed to fetch popular news');
			}
		});
	});
</script>

<main class="pt-[80px] bg-[#090909]">
	<NewsAssetPriceRow />

	<div
		class="flex justify-center gap-x-4 px-16 -desktop:flex-col -desktop:px-0 opacity-0 transition-opacity duration-1000 overflow-hidden"
		class:!opacity-100={$innerWidth}
	>
		<div
			class="max-w-screen-lg mx-auto pt-7 pb-16 -desktop:pb-0 flex-grow duration-500 w-full overflow-hidden"
			class:opacity-50={newsService.isFetching}
		>
			<div class="-desktop:px-4">
				<TopFeaturedStorySection article={newsService.popularNews[0]} />
			</div>

			<div class="pt-5">
				<LatestNewsSection articles={newsService.news} />
			</div>
		</div>

		{#if $innerWidth && $innerWidth > DESKTOP_BREAKPOINT}
			<div class="w-[500px] flex-grow-0">
				<div class="pt-20 max-w-lg w-full">
					<CfgiWidget />
				</div>

				<div class="pt-4 max-w-lg w-full">
					<PopularNewsWidget articles={newsService.popularNews} />
				</div>
			</div>
		{/if}
	</div>
</main>
