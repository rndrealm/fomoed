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
	import NewsLabPostsWidget from '$lib/comps/NewsLabPostsWidget/NewsLabPostsWidget.svelte';

	onMount(async () => {
		if (!newsService.news.length) {
			newsService.fetchNews();
			newsService.fetchPopularNews().then((ok) => {
				if (!ok) {
					toast.error('Failed to fetch popular news');
				}
			});
			newsService.fetchNewsLabPosts().then((ok) => {
				if (!ok) {
					toast.error('Failed to fetch news lab posts');
				}
			});
		}
	});
</script>

<main class="pt-[7rem] bg-[#090909]">
	<NewsAssetPriceRow />

	<div
		class="flex justify-center px-16 transition-opacity duration-1000 opacity-0 gap-x-4 -desktop:flex-col -desktop:px-0"
		class:!opacity-100={$innerWidth}
	>
		<div
			class="w-full max-w-screen-lg pb-16 mx-auto overflow-hidden duration-500 pt-7 -desktop:pb-0"
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
			<div class="w-[700px]">
				<div class="w-full max-w-lg pt-20">
					<CfgiWidget />
				</div>

				<div class="w-full max-w-lg pt-4">
					<PopularNewsWidget articles={newsService.popularNews} />
				</div>
			</div>
		{/if}
	</div>
</main>
