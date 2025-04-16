<script lang="ts">
	import { monthDay } from '$ts/client/utils';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import SentimentPill from '$lib/comps/custom/SentimentPill/SentimentPill.svelte';
	import AssetPricePill from '../custom/AssetPricePill/AssetPricePill.svelte';
	import { likesService } from '$ts/client/services/LikesService.client.svelte';
	import toast from 'svelte-french-toast';
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
		class="font-inter bg-[#110F0E] text-white p-4 border-[0.5px] border-[#2B2B2B] rounded-[20px] flex flex-col h-full"
	>
		<!-- Top Row: Source, Published Time, Sentiment -->
		<div class="flex items-center flex-wrap gap-4 text-sm mb-2">
			<!-- Source -->
			{#if article.source}
				<span class="text-[#FF9256] font-medium">{article.source}</span>
			{/if}

			<!-- Published Time -->
			{#if article.published_at}
				<span class="text-[#A6A6A6] font-medium">{monthDay(article.published_at)}</span>
			{/if}

			<!-- Sentiment Pill -->
			{#if article.sentiment}
				<SentimentPill sentiment={article.sentiment} />
			{/if}

			{#each article.symbols as symbol}
				<AssetPricePill {symbol} />
			{/each}

			<div class="flex-grow"></div>

			<!-- Like Button -->
			{#if showLikeCountInHeadline}
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
			{/if}
		</div>

		<!-- Headline -->
		<h2 class="text-xl font-bold text-white leading-snug mb-2 pt-1">
			{@html article.title}
		</h2>

		<!-- Summary -->
		{#if article.summary}
			<p class="text-[#A6A6A6] line-clamp-2 overflow-hidden text-ellipsis">
				{@html article.summary}
			</p>
		{/if}

		<!-- Filler, keep -->
		<div class="flex-grow"></div>

		<!-- Bottom Row: Engagement Metrics -->
		{#if !hideBottomBar}
			<div class="mt-4">
				<NewsHeadlineBottomBar {article} showSourceAndTime={false} />
			</div>
		{/if}
	</div>
</a>
