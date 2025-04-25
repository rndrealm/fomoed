<script lang="ts">
	import { DashboardService } from '$ts/client/services/DashboardService.client';
	import { newsService } from '$ts/client/services/NewsService.client.svelte';
	import { NewsService as NewsServiceOld } from '$ts/client/services/NewsServiceOld.client';
	import { setContext } from 'svelte';

	const dashboardService = new DashboardService();

	setContext('newsService', new NewsServiceOld());
	setContext('dashboardService', dashboardService);
</script>

<slot />
