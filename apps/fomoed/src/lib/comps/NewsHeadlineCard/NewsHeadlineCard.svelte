<script lang="ts">
	import NewsHeadlineBottomBar from '$lib/comps/NewsHeadlineBottomBar/NewsHeadlineBottomBar.svelte';
	import TextSkeleton from '../skeletons/TextSkeleton.svelte';
	import type { PostLike } from '$ts/client/types/posts';

	type Props = {
		article: PostLike;
		skeleton?: boolean;
	};

	let { article, skeleton = false }: Props = $props();
</script>

<a href={article?.detailUrl} class="block duration-500 ease-in-out" class:skeletoned={skeleton}>
	<div
		class="font-inter bg-[#070707] text-white pt-10 border-[0.5px] border-[#1E1E1E] rounded-[20px]"
	>
		<!-- Headline -->
		<h2
			class="text-[28px] font-semibold tracking-[-0.02em] text-white leading-snug mb-[14px] relative px-8"
			class:whitespace-pre={skeleton}
		>
			<TextSkeleton absolute {skeleton} wrap={false} />

			{@html article?.title || ' '}
		</h2>

		<!-- Summary -->
		<p
			class="text-[#919191] mb-0 relative text-[18px] leading-[135%] font-semibold tracking-[-0.02em] px-8 line-clamp-4"
			class:whitespace-pre={skeleton}
		>
			<TextSkeleton absolute {skeleton} wrap={false} />

			{@html article?.summary || ' '}
		</p>

		<!-- Bottom Row -->
		<div class="mt-16">
			<NewsHeadlineBottomBar {article} {skeleton} />
		</div>
	</div>
</a>

<style>
	.skeletoned {
		@apply scale-[0.99] !max-h-[210px];
	}
</style>
