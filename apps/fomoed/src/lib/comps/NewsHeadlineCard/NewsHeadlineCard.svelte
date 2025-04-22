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

<a
	href={article?.detailUrl}
	class="block duration-500 max-h-[400px] -desktop:max-h-[500px] ease-in-out"
	class:skeletoned={skeleton}
>
	<div
		class="font-inter bg-[#110F0E] text-white p-4 border-[0.5px] border-[#2B2B2B] rounded-[20px]"
	>
		<!-- Headline -->
		<h2
			class="text-3xl font-bold text-white leading-snug mb-2 relative"
			class:whitespace-pre={skeleton}
		>
			<TextSkeleton absolute {skeleton} wrap={false} />

			{@html article?.title || ' '}
		</h2>

		<!-- Summary -->
		<p class="text-[#A6A6A6] mb-4 relative" class:whitespace-pre={skeleton}>
			<TextSkeleton absolute {skeleton} wrap={false} />

			{@html article?.summary || ' '}
		</p>

		<!-- Bottom Row -->
		<NewsHeadlineBottomBar {article} {skeleton} />
	</div>
</a>

<style>
	.skeletoned {
		@apply scale-[0.99] !max-h-[210px];
	}
</style>
