<script lang="ts">
	import NewsIcon from '$lib/icons/NewsIcon.svelte';
	import type { PostLike } from '$ts/client/types/posts';
	import NewsHeadlineCardCompact from '../NewsHeadlineCardCompact/NewsHeadlineCardCompact.svelte';

	let { posts }: { posts: PostLike[] } = $props();
</script>

<div
	class="innerShadow max-w-lg mx-auto border-[0.5px] border-[#2B2B2B] py-3 px-2 bg-[#110F0E] rounded-[20px]"
>
	<!-- Header Section -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-x-2 pl-2">
			<div class="size-5">
				<NewsIcon />
			</div>

			<h2 class="text-lg font-bold whitespace-nowrap">NewsLab posts</h2>
		</div>
	</div>

	<!-- Articles -->
	<div class="grid gap-y-4 pt-4">
		{#each posts as article}
			<NewsHeadlineCardCompact {article} hideBottomBar showLikeCountInHeadline />
		{/each}
	</div>
</div>

<style>
	.innerShadow {
		box-shadow: 0px 0px 16px 1px #ffffff14 inset;
	}
</style>
