<script lang="ts">
	import CommentIcon from '$lib/icons/CommentIcon.svelte';
	import LikeIcon from '$lib/icons/LikeIcon.svelte';
	import SentimentPill from '../custom/SentimentPill/SentimentPill.svelte';
	import SharePopupButton from '../SharePopup/SharePopupButton.svelte';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import { timeAgo } from '$ts/client/utils';

	export let article: AppNewsItem;
</script>

<div
	class="flex items-center justify-between
             text-white
            px-0 py-0 rounded-md w-full mt-5 mb-2 font-inter -desktop:flex-wrap gap-y-2"
>
	<!-- Left section: Source, Time, Status -->
	<div class="flex items-center gap-3">
		<!-- Source -->
		<span class="font-semibold text-[#ffffff]">
			{article.source}
		</span>

		<div class="separator-dot"></div>

		<!-- Time Ago -->
		<span class="text-[#A5A5A5] font-normal whitespace-nowrap">
			{timeAgo(article.published_at)}
		</span>

		<div class="pl-1">
			<SentimentPill sentiment={article.sentiment} class="!text-base" />
		</div>
	</div>

	<!-- Right section: Like, Comment, Share -->
	<div class="flex items-center gap-3 text-gray-400">
		<!-- Likes -->
		<button
			class="flex items-center space-x-1 hover:text-gray-200 transition-colors"
			onclick={() => console.log('Liked')}
		>
			<LikeIcon />
			<span>{article.likes_count}</span>
		</button>

		<div class="separator-dot"></div>

		<!-- Comments -->
		<a class="flex items-center space-x-1 hover:text-gray-200 transition-colors" href="#comments">
			<CommentIcon />
			<span>{article.comments_count}</span>
		</a>

		<div class="separator-dot"></div>

		<!-- Share -->
		<SharePopupButton postUrl={article.detailUrl} />
	</div>
</div>

<style>
	.separator-dot {
		@apply size-0.5 rounded-full bg-[#A6A6A6];
	}
</style>
