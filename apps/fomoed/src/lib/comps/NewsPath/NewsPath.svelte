<script lang="ts">
	import NewsIcon from '$lib/icons/NewsIcon.svelte';
</script>

<div class="flex gap-x-2 text-[#929292] items-center font-inter font-medium px-3">
	<div class="size-5">
		<NewsIcon />
	</div>

	<a href="/dashboard">Dashboard</a>

	<div class="cursor-default">/</div>

	<a href="/news">News</a>
</div>

<style>
	a {
		@apply hover:text-new-white transition duration-100;
	}
</style>
