<script>
	import DashboardIcon from '$lib/icons/DashboardIcon.svelte';

	// You can add props here if needed, for example:
	// let { activePage } = $props();
</script>

<a
	href="/dashboard"
	class="px-4 h-[40px] transition-colors rounded-full border border-[#2B2B2B] font-inter font-semibold inline-flex items-center gap-x-2 text-sm"
>
	<DashboardIcon />

	<div class="-desktop:hidden">Dashboard</div>
</a>
