<script lang="ts">
	import CommentIcon from '$lib/icons/CommentIcon.svelte';
	import LikeIcon from '$lib/icons/LikeIcon.svelte';
	import LikeIconFull from '$lib/icons/LikeIconFull.svelte';
	import SentimentPill from '$lib/comps/custom/SentimentPill/SentimentPill.svelte';
	import { timeAgo } from '$ts/client/utils';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import SharePopupButton from '$lib/comps/SharePopup/SharePopupButton.svelte';
	import { likesService } from '$ts/client/services/LikesService.client.svelte';
	import { bookmarksService } from '$ts/client/services/BookmarksService.client.svelte';
	import toast from 'svelte-5-french-toast';
	import { Bookmark } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import BookmarkIcon from '$lib/icons/social/BookmarkIcon.svelte';
	import BookmarkIconFilled from '$lib/icons/social/BookmarkIconFilled.svelte';

	type Props = {
		article: AppNewsItem;
		showSourceAndTime?: boolean;
		skeleton?: boolean;
		compact?: boolean;
	};

	let { article, showSourceAndTime = true, skeleton = false, compact = false }: Props = $props();

	async function handleLikeToggle() {
		const ok = await likesService.toggleLikeNewsPost(article);

		if (!ok) {
			toast.error('Failed to toggle like.');
		}
	}

	async function handleBookmarkToggle() {
		const ok = await bookmarksService.toggleBookmarkNewsPost(article);

		if (!ok) {
			toast.error('Failed to toggle bookmark.');
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="pb-0 text-sm text-gray-500" onclick={(e) => e.preventDefault()}>
	<div class="px-8">
		<!-- Source -->
		{#if showSourceAndTime}
			<span
				class="text-[#ED8453] text-[15px] font-semibold text-base -desktop:flex-grow"
				class:skeleton
			>
				{article?.source || ' '}
			</span>
		{/if}

		<!-- Published Time -->
		{#if showSourceAndTime}
			<span class="text-[#A5A5A5] text-[15px] font-normal" class:skeleton>
				<span class="p-[6px]">•</span>{article ? timeAgo(article.published_at) : ' '}
			</span>
		{/if}
	</div>

	<!-- Ticker / Price (Currently disabled) -->
	<!-- {#if article.tickerSymbol && article.currentPrice}
        <span class="flex items-center gap-1">
            <span class="font-semibold text-gray-300">{article.tickerSymbol}:</span>
            <span class="text-gray-300">{article.currentPrice}</span>
            {#if article.priceChange}
                <span style="color: {article.priceChangeColor || 'inherit'}">
                    {article.priceChange}
                </span>
            {/if}
        </span>
    {/if} -->

	<div
		class="flex items-center pt-4 mt-4 flex-shrink-0 w-full -desktop:w-full gap-x-4 border-t border-t-[#1E1E1E] {compact
			? 'px-5 py-[14px]'
			: 'px-8 py-6'}"
	>
		<!-- Likes -->
		<button
			onclick={handleLikeToggle}
			class="flex items-center justify-start flex-shrink-0 gap-2 group"
		>
			<div class="group-active:scale-90 duration-100 text-[#858585] group-active:text-white">
				{#if article?.userLiked}
					<LikeIconFull />
				{:else}
					<LikeIcon />
				{/if}
			</div>

			<span class="text-[#A5A5A5] text-[15px]" class:skeleton>{article?.likes_count}</span>
		</button>

		<!-- <div class="size-0.5 rounded-full bg-[#A6A6A6] -desktop:hidden"></div> -->

		<!-- Comments -->
		<button
			class="flex items-center justify-center gap-2 mt-[2px]"
			onclick={(e) => {
				e.preventDefault();
				goto(article.detailUrl + '#comments');
			}}
		>
			<CommentIcon />
			<span class="text-[#A5A5A5] text-[15px]" class:skeleton>{article?.comments_count}</span>
		</button>

		<div class="flex-grow"></div>

		<!-- Bookmark -->
		<button
			onclick={handleBookmarkToggle}
			class="flex items-center justify-center gap-1 py-2 group"
		>
			<div class="group-active:scale-90 duration-100 text-[#858585] group-active:text-white">
				{#if article?.userBookmarked}
					<BookmarkIconFilled />
				{:else}
					<BookmarkIcon />
				{/if}
				<!-- <Bookmark size={18} fill={article?.userBookmarked ? 'currentColor' : 'none'} /> -->
			</div>
		</button>

		<!-- <div class="size-0.5 rounded-full bg-[#A6A6A6] -desktop:hidden"></div> -->

		<!-- Share -->
		<div class="flex items-center justify-end gap-1 cursor-pointer">
			<SharePopupButton postUrl={article?.detailUrl} />
		</div>
	</div>
</div>
