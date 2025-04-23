<script lang="ts">
	import CommentIcon from '$lib/icons/CommentIcon.svelte';
	import LikeIcon from '$lib/icons/LikeIcon.svelte';
	import LikeIconFull from '$lib/icons/LikeIconFull.svelte';
	import SentimentPill from '$lib/comps/custom/SentimentPill/SentimentPill.svelte';
	import { timeAgo } from '$ts/client/utils';
	import SharePopupButton from '$lib/comps/SharePopup/SharePopupButton.svelte';
	import { likesService } from '$ts/client/services/LikesService.client.svelte';
	import { bookmarksService } from '$ts/client/services/BookmarksService.client.svelte';
	import toast from 'svelte-5-french-toast';
	import { Bookmark } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { PostLike } from '$ts/client/types/posts';
	import { userService } from '$ts/client/services/UserService.svelte';

	type Props = {
		article: PostLike;
		showSourceAndTime?: boolean;
		skeleton?: boolean;
	};

	let { article, showSourceAndTime = true, skeleton = false }: Props = $props();

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
<div
	class="flex items-center flex-wrap gap-4 gap-y-2 text-sm text-gray-500 bg-[#1F1D1C] px-5 py-3 rounded-lg -desktop:flex-wrap"
	onclick={(e) => e.preventDefault()}
>
	<!-- Source -->
	{#if showSourceAndTime}
		<span class="text-[#FF9256] font-medium -desktop:flex-grow" class:skeleton>
			{article?.source || ' '}
		</span>
	{/if}

	<!-- Published Time -->
	{#if showSourceAndTime}
		<span class="text-[#A6A6A6] font-medium" class:skeleton>
			{article ? timeAgo(article.published_at) : ' '}
		</span>
	{/if}

	<!-- Sentiment Pill -->
	{#if article?.sentiment}
		<SentimentPill sentiment={article.sentiment} />
	{/if}

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

	<div class="flex flex-shrink-0 -desktop:w-full items-center gap-x-2 w-full">
		<!-- Likes -->
		<button
			disabled={!userService.isLoggedIn}
			onclick={handleLikeToggle}
			class="flex items-center gap-1 flex-shrink-0 justify-start group py-2 pr-1"
		>
			<div class="group-active:scale-90 duration-100 text-[#858585] group-active:text-white">
				{#if article?.userLiked}
					<LikeIconFull />
				{:else}
					<LikeIcon />
				{/if}
			</div>

			<span class="text-[#A6A6A6]" class:skeleton>{article?.likes_count}</span>
		</button>

		<div class="size-0.5 rounded-full bg-[#A6A6A6] -desktop:hidden"></div>

		<!-- Comments -->
		<button
			class="flex items-center gap-1 justify-center px-1"
			onclick={(e) => {
				e.preventDefault();
				goto(article.detailUrl + '#comments');
			}}
		>
			<CommentIcon />
			<span class="text-[#A6A6A6]" class:skeleton>{article?.comments_count}</span>
		</button>

		<div class="flex-grow"></div>

		<!-- Bookmark -->
		<button
			onclick={handleBookmarkToggle}
			class="flex items-center gap-1 justify-center group py-2"
		>
			<div class="group-active:scale-90 duration-100 text-[#858585] group-active:text-white">
				<Bookmark size={18} fill={article?.userBookmarked ? 'currentColor' : 'none'} />
			</div>
		</button>

		<!-- <div class="size-0.5 rounded-full bg-[#A6A6A6] -desktop:hidden"></div> -->

		<!-- Share -->
		<div class="flex items-center gap-1 cursor-pointer justify-end">
			<SharePopupButton postUrl={article?.detailUrl} />
		</div>
	</div>
</div>
