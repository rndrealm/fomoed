<script lang="ts">
	import { coinstats_selected_coin } from '$lib/stores';
	import {
		infiniteNews,
		newsService,
		type AppNewsItem
	} from '$ts/client/services/NewsService.client.svelte';
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import LatestNewsSection from '../LatestNewsSection/LatestNewsSection.svelte';
	import NewsFilterChips from '../NewsFilterChips/NewsFilterChips.svelte';
	import NewsHeadlineCardCompact from '../NewsHeadlineCardCompact/NewsHeadlineCardCompact.svelte';
	import { inview } from 'svelte-inview';

	$: if ($coinstats_selected_coin?.symbol) {
		newsService.setCurrency($coinstats_selected_coin.symbol);
		newsService.infiniteNews.set([]);
		newsService.setPage(1);
		newsService.fetchNews();
	}

	async function loadNextPage() {
		if (newsService.hasNextPage && !newsService.isFetching) {
			newsService.nextPage();
		}
	}
</script>

<div class="p-4 md:p-[30px] border border-[#141414] rounded-3xl bg-[#070707] mb-4">
	<div class="flex flex-col gap-5">
		<div class="flex flex-col gap-[14px]">
			<p class="text-2xl font-medium text-white">{$coinstats_selected_coin?.name} News</p>

			<NewsFilterChips
				active={newsService.filter}
				onChange={(value) => {
					newsService.infiniteNews.set([]);
					newsService.filter = value;
					newsService.fetchNews();
				}}
			/>
		</div>

		<div class="h-[500px] overflow-auto no-scrollbar">
			<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 pt-4">
				{#each $infiniteNews as article (article.id)}
					<NewsHeadlineCardCompact {article} />
				{/each}

				{#if newsService.hasNextPage}
					{#each Array(1) as _, i}
						<!-- First loading card with inview trigger -->
						<div
							class="animate-pulse rounded-[20px] bg-[#1a1a1a] p-4 w-full max-w-sm space-y-4 min-h-[350px] h-full"
							use:inview={{ threshold: 0.1 }}
							on:inview_enter={loadNextPage}
						>
							<div class="h-40 rounded-md bg-neutral-800"></div>
							<div class="w-full h-4 rounded bg-neutral-800"></div>
							<div class="w-1/2 h-4 rounded bg-neutral-800"></div>
							<div class="w-full h-4 rounded bg-neutral-800"></div>
							<div class="w-1/2 h-4 rounded bg-neutral-800"></div>
						</div>
					{/each}
				{:else if newsService.news.length > 0}
					<p class="py-4 text-sm text-center text-white">No more news</p>
				{/if}
			</div>
		</div>
	</div>
	<!-- <LatestNewsSection articles={newsService.news} /> -->
</div>

<!-- <NewsHeadlineCardCompact {article} /> -->
