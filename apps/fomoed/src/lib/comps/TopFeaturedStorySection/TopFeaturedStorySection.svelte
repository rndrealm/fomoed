<script lang="ts">
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import NewsHeadlineCard from '../NewsHeadlineCard/NewsHeadlineCard.svelte';

	let { article } = $props<{ article: AppNewsItem }>();
	// console.log('article', article);
</script>

<div class="grid overflow-hidden">
	<h2 class="pl-1 text-2xl font-medium font-inter">Top Featured Story</h2>

	<div class="max-w-full pt-6 overflow-hidden">
		<NewsHeadlineCard {article} skeleton={!article} />
	</div>
</div>
