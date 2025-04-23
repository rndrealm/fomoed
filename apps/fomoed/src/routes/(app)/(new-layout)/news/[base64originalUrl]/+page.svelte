<script lang="ts">
	import { page } from '$app/state';
	import CfgiWidget from '$lib/comps/CfgiWidget/CfgiWidget.svelte';
	import CommentThread from '$lib/comps/CommentThread/CommentThread.svelte';
	import ArticleAuthorWidget from '$lib/comps/custom/ArticleAuthorWidget/ArticleAuthorWidget.svelte';
	import ArticleRenderer from '$lib/comps/custom/ArticleRenderer/ArticleRenderer.svelte';
	import { DESKTOP_BREAKPOINT, innerWidth } from '$lib/stores/ui';
	import { cfgi_supported_tokens } from '$lib/utils/cfgi_data';
	import { newsService } from '$ts/client/services/NewsService.client.svelte.ts';
	import {
		commentsService,
		type AppComment
	} from '$ts/client/services/CommentsService.client.svelte.ts';
	import { decodeFromBase64 } from '$ts/client/utils';
	import type { ParsedArticle } from '$ts/common/types';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { getContext, onMount, tick } from 'svelte';
	import toast from 'svelte-5-french-toast';
	import NewsPath from '$lib/comps/NewsPath/NewsPath.svelte';
	import type { PostLike } from '$ts/client/types/posts';

	const { base64originalUrl } = page.params;

	const supabase: SupabaseClient = getContext('supabase');

	let isLoading = $state(true);
	let isLoadingComments = $state(true);

	let article: PostLike | null = $state(null);
	let parsedArticle: ParsedArticle | null = $state(null);
	let comments: AppComment[] = $state([]);

	onMount(async () => {
		const originalUrl = decodeFromBase64(base64originalUrl);

		parsedArticle = await newsService.getParsedArticleUsingProxy(originalUrl);

		if (!article) {
			article = await newsService.getArticleByOriginalUrl(supabase, originalUrl);
		}

		isLoading = false;

		if (article) {
			const fetchedComments = await commentsService.fetchComments(article.id, true);

			if (!fetchedComments) {
				toast.error('Failed to load comments.');
				return;
			}

			comments = fetchedComments;
		}

		isLoadingComments = false;

		await tick();

		if (window.location.href.includes('#comments')) {
			const commentsElement = document.getElementById('comments');

			if (commentsElement) {
				commentsElement.scrollIntoView({ behavior: 'smooth' });
			}
		}
	});
</script>

<main class="pt-[80px] bg-[#0E0E0E] min-h-screen">
	<div
		class="pb-4 pt-4 fixed bg-[#0e0e0e55] w-full shadow-xl backdrop-blur-xl backdrop-brightness-[0.3] z-50"
	>
		<div class="max-w-screen-xl mx-auto">
			<NewsPath />
		</div>
	</div>

	<div class="max-w-screen-xl mx-auto pt-14 pb-16 px-4 overflow-hidden">
		{#if isLoading}
			<!-- Loading state -->
			<div class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		{:else if article && parsedArticle}
			<!-- Article content -->
			<div class="mx-auto flex gap-x-8 overflow-hidden">
				<div class="max-w-screen-lg flex-shrink w-full overflow-hidden">
					<ArticleRenderer {article} articleContent={parsedArticle.htmlContent} />

					<div class="pt-6 w-full">
						<ArticleAuthorWidget authorName={parsedArticle.author.name} />
					</div>

					<!-- Comments section -->
					{#if isLoadingComments}
						<div class="mt-8 flex justify-center items-center h-32">
							<div
								class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"
							></div>
						</div>
					{:else}
						<div class="pt-4 w-full overflow-hidden">
							<CommentThread {comments} newsItem={article} />
						</div>
					{/if}
				</div>

				{#if $innerWidth && $innerWidth > DESKTOP_BREAKPOINT}
					<div class="w-full max-w-md flex flex-col gap-y-4">
						{#each article.symbols as symbol}
							{#if cfgi_supported_tokens.includes(symbol)}
								<CfgiWidget {symbol}></CfgiWidget>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<!-- Error state -->
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
				<p>Error loading article.</p>
			</div>
		{/if}
	</div>
</main>
