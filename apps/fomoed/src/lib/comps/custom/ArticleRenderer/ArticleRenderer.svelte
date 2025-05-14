<script lang="ts">
	import ArticleBelowHeadingBar from '$lib/comps/ArticleBelowHeadingBar/ArticleBelowHeadingBar.svelte';
	import type { PostLike } from '$ts/client/types/posts';
	import { embedWidgets } from '$ts/client/utils/posts';

	let { article, articleContent } = $props<{
		article: PostLike;
		articleContent: string;
	}>();
</script>

<h1 class="text-5xl font-semibold leading-tight font-inter -desktop:text-4xl text-new-white">
	{@html article.title}
</h1>

<ArticleBelowHeadingBar {article} />

<div
	class="pt-0 leading-relaxed _article_content_container font-inter text-new-white -desktop:text-justify"
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
		width: 100%;
	}

	._article_content_container :global(iframe) {
		@apply my-8 w-full;
	}
</style>
