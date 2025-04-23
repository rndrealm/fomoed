<script lang="ts">
	import { monthDay } from '$ts/client/utils';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import SentimentPill from '$lib/comps/custom/SentimentPill/SentimentPill.svelte';
	import AssetPricePill from '../custom/AssetPricePill/AssetPricePill.svelte';
	import { likesService } from '$ts/client/services/LikesService.client.svelte';
	import toast from 'svelte-5-french-toast';
	import NewsHeadlineBottomBar from '../NewsHeadlineBottomBar/NewsHeadlineBottomBar.svelte';
	import LikeIcon from '$lib/icons/LikeIcon.svelte';
	import LikeIconFull from '$lib/icons/LikeIconFull.svelte';
	import { fade } from 'svelte/transition';

	type Props = {
		article: AppNewsItem;
		hideBottomBar?: boolean;
		showLikeCountInHeadline?: boolean;
	};

	let { article, hideBottomBar = false, showLikeCountInHeadline = false }: Props = $props();

	async function handleLikeToggle(e: Event) {
		e.preventDefault();

		const ok = await likesService.toggleLikeNewsPost(article);

		if (!ok) {
			toast.error('Failed to toggle like.');
		}
	}
</script>

<a href={article.detailUrl} class="block h-full" in:fade>
	<div
		class="font-inter bg-[#121212] text-white px-0 border-[0.5px] border-[#1E1E1E] py-6 rounded-[20px] flex flex-col h-full"
	>
		<!-- Top Row: Source, Published Time, Sentiment -->
		<div class="flex items-center justify-between gap-4 pl-5 pr-[1.875rem] pb-6 text-sm">
			<!-- Source -->
			{#if article.source}
				<span class="text-white font-semibold text-[15px]">{article.source}</span>
			{/if}

			<!-- Published Time -->
			{#if article.published_at}
				<span class="text-[#AFAFAF] text-[13px] font-normal">{monthDay(article.published_at)}</span>
			{/if}

			<!-- Sentiment Pill -->
			<!-- {#if article.sentiment}
				<SentimentPill sentiment={article.sentiment} />
			{/if} -->

			<!-- <div class="flex-grow"></div> -->
		</div>

		<div class="pb-9">
			<!-- Headline -->
			<h2 class="px-5 pb-2 text-lg font-normal leading-snug text-white">
				{@html article.title}
			</h2>

			<!-- Summary -->
			{#if article.summary}
				<p
					class="text-[#878787] font-normal text-sm line-clamp-2 overflow-hidden text-ellipsis px-5"
				>
					{@html article.summary}
				</p>
			{/if}
		</div>

		<!-- Filler, keep -->
		<div class="flex-grow"></div>
		<button class="flex gap-[5px] overflow-auto px-6 z-[100] no-scrollbar">
			{#each article.symbols as symbol}
				<AssetPricePill {symbol} />
			{/each}
		</button>

		<!-- Bottom Row: Engagement Metrics -->
		{#if !hideBottomBar}
			<div class="mt-0">
				<NewsHeadlineBottomBar {article} showSourceAndTime={false} compact={true} />
			</div>
		{/if}

		<!-- Like Button -->
		{#if showLikeCountInHeadline}
			<div class="px-5 pt-4">
				<button
					onclick={handleLikeToggle}
					class="text-[#A6A6A6] font-medium flex items-center"
					title="Like this article"
				>
					<div class="px-2">
						{#if article.userLiked}
							<LikeIconFull />
						{:else}
							<LikeIcon />
						{/if}
					</div>

					{article.likes_count}
				</button>
			</div>
		{/if}
	</div>
</a>
