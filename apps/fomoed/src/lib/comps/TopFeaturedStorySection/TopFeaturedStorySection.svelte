<script lang="ts">
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import NewsHeadlineCard from '../NewsHeadlineCard/NewsHeadlineCard.svelte';

	let { article } = $props<{ article: AppNewsItem }>();
</script>

<div class="grid overflow-hidden">
	<h2 class="font-semibold text-2xl font-inter pl-1">Top Featured Story</h2>

	<div class="pt-4 max-w-full overflow-hidden">
		<NewsHeadlineCard {article} skeleton={!article} />
	</div>
</div>
