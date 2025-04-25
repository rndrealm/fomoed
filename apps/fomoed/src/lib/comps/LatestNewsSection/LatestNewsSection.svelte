<script lang="ts">
	import NewsFilterChips from '../NewsFilterChips/NewsFilterChips.svelte';
	import NewsHeadlineCardCompact from '../NewsHeadlineCardCompact/NewsHeadlineCardCompact.svelte';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import PaginationBar from '$lib/comps/PaginationBar/PaginationBar.svelte';
	import { newsService } from '$ts/client/services/NewsService.client.svelte';

	let { articles } = $props<{ articles: AppNewsItem[] }>();

	let innerWidth = $state(0);

	// Function to chunk articles into the specified pattern
	function chunkArticles(articles: AppNewsItem[], width: number) {
		// For smaller screens, put each article in its own chunk (single column)
		if (width < 1400) {
			return articles.map((article) => [article]);
		}

		// For larger screens, use the alternating pattern
		const pattern = [3, 2];
		const chunks = [];
		let currentIndex = 0;

		while (currentIndex < articles.length) {
			const patternIndex = chunks.length % pattern.length;
			const chunkSize = pattern[patternIndex];
			const endIndex = Math.min(currentIndex + chunkSize, articles.length);

			chunks.push(articles.slice(currentIndex, endIndex));
			currentIndex = endIndex;
		}

		return chunks;
	}

	let articleRows = $derived.by(() => chunkArticles(articles, innerWidth));

	function handlePageChange(page: number) {
		newsService.setPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:window bind:innerWidth />
<div
	class="bg-[#070707] border-[0.5px] border-[#1E1E1E] pt-7 pb-1 px-4 md:px-7 rounded-[20px] -desktop:rounded-none"
>
	<h2
		class="text-2xl font-medium text-new-white -desktop:font-black -desktop:text-3xl -desktop:py-2"
	>
		Latest News
	</h2>

	<div class="pt-[14px]">
		<NewsFilterChips
			active={newsService.filter}
			onChange={(value) => {
				newsService.filter = value;
				newsService.fetchNews();
			}}
		/>
	</div>

	<!-- Article Grid -->
	<div
		class="grid gap-3 mt-6 grid-cols-[repeat(auto-fit,minmax(247px,2fr))] md:grid-cols-[repeat(auto-fit,minmax(347px,2fr))]"
		style=""
	>
		{#each articleRows as row, rowIndex}
			<!-- Article Row -->
			<!-- <div class="grid gap-4" style="grid-template-columns: repeat(2, minmax(0, 1fr));"> -->
			<!-- <div class="grid gap-4" style="grid-template-columns: repeat({row.length}, minmax(0, 1fr));"> -->
			{#each row as article}
				<NewsHeadlineCardCompact {article} />
			{/each}
			<!-- </div> -->
		{/each}
	</div>

	<div class="pt-5">
		<PaginationBar
			currentPage={newsService.currentPage}
			totalPages={newsService.totalPages}
			onPageChange={handlePageChange}
		/>
	</div>
</div>
