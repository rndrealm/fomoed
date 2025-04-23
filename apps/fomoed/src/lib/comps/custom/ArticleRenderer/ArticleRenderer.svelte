<script lang="ts">
	import ArticleBelowHeadingBar from '$lib/comps/ArticleBelowHeadingBar/ArticleBelowHeadingBar.svelte';
	import type { PostLike } from '$ts/client/types/posts';
	import { embedWidgets } from '$ts/client/utils/posts';

	let { article, articleContent } = $props<{
		article: PostLike;
		articleContent: string;
	}>();
</script>

<h1 class="font-semibold font-inter text-5xl -desktop:text-4xl text-new-white leading-tight">
	{@html article.title}
</h1>

<ArticleBelowHeadingBar {article} />

<div
	class="_article_content_container font-inter pt-8 text-new-white leading-relaxed -desktop:text-justify"
>
	{@html embedWidgets(articleContent)}
</div>

<ArticleBelowHeadingBar {article} />

<style>
	._article_content_container :global(h2) {
		@apply text-lg font-bold mt-8;
	}

	._article_content_container :global(h3) {
		@apply text-base font-bold mt-6;
	}

	._article_content_container :global(img) {
		@apply my-8 min-w-[400px];
	}

	._article_content_container :global(iframe) {
		@apply my-8 w-full;
	}
</style>
