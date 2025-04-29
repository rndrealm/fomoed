<script lang="ts">
	import NewsIcon from '$lib/icons/NewsIcon.svelte';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import NewsHeadlineCardCompactV2 from '../NewsHeadlineCardCompact/NewsHeadlineCardCompactV2.svelte';

	let { articles, isFetching } = $props<{ articles: AppNewsItem[]; isFetching: boolean }>();
</script>

<div class="px-[0px] relative rounded-[20px]">
	<div class="news_border"></div>
	<div
		class=" max-w-lg mx-auto border-[0.5px] border-[#2B2B2B] py-8 px-6 bg-[#070707] rounded-[20px] relative"
	>
		<!-- Header Section -->
		<div class="flex items-center justify-between">
			<div class="flex items-center pl-2 gap-x-2">
				<div class="size-5">
					<NewsIcon />
				</div>

				<h2 class="text-xl font-medium whitespace-nowrap">Popular News</h2>
			</div>
		</div>

		<!-- Articles -->

		<div class=" grid pt-4 gap-y-4 bg-[#070707]">
			{#if isFetching}
				{#each Array(5).fill(null) as _, index}
					<!-- Replace this with your Skeleton Loader component -->
					<div class="h-[300px] bg-[#121212] rounded-md skeleton-loader"></div>
				{/each}
			{:else}
				{#each articles as article}
					<NewsHeadlineCardCompactV2 {article} hideBottomBar showLikeCountInHeadline />
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	.innerShadow {
		box-shadow: 0px 0px 16px 1px #ffffff14 inset;
	}
</style>
