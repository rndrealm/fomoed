<script lang="ts">
	import NextPageIcon from '$lib/icons/NextPageIcon.svelte';
	import { innerWidth } from '$lib/stores/ui';

	let { currentPage = 1, totalPages = 5, onPageChange = (page: number) => {} } = $props();

	// Calculate which page numbers to show
	let visiblePages = $derived.by(() => {
		const pages: (number | string)[] = [];

		// Mobile view - show minimal pages
		if ($innerWidth && $innerWidth < 500) {
			// Always show first page
			pages.push(1);

			// Show current page if it's not the first page
			if (currentPage > 1 && currentPage < totalPages) {
				// Add ellipsis if there's a gap
				if (currentPage > 2) {
					pages.push('...');
				}
				pages.push(currentPage);
			}

			// Show last page if there are multiple pages
			if (totalPages > 1) {
				// Add ellipsis if there's a gap
				if (currentPage < totalPages - 1) {
					pages.push('...');
				}
				pages.push(totalPages);
			}
		} else {
			// Desktop view - show more pages
			// Always show first page
			pages.push(1);

			// Calculate range around current page
			const rangeStart = Math.max(2, currentPage - 1);
			const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

			// Add ellipsis after first page if needed
			if (rangeStart > 2) {
				pages.push('...');
			}

			// Add pages in range
			for (let i = rangeStart; i <= rangeEnd; i++) {
				pages.push(i);
			}

			// Add ellipsis before last page if needed
			if (rangeEnd < totalPages - 1) {
				pages.push('...');
			}

			// Always show last page if more than one page
			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}

		return pages;
	});

	// Handle page change
	function changePage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			onPageChange?.(page);
		}
	}
</script>

<div
	class="flex items-center justify-center gap-3 -desktop:gap-x-0 w-full py-2 bg-black rounded-lg p-2 -desktop:text-xs"
>
	<!-- Previous button -->
	<button
		class="pagination-nav-button w-[32px] h-[32px] flex items-center justify-center"
		class:disabled={currentPage === 1}
		disabled={currentPage === 1}
		onclick={() => changePage(currentPage - 1)}
	>
		<!-- <div class="rotate-180">
			<NextPageIcon />
		</div>

		<div class="-desktop:hidden">Previous</div> -->
		<img src="/icons/left-pagination.svg" alt="icon" />
	</button>

	<!-- Page numbers -->
	<div class="flex items-center gap-1">
		{#each visiblePages as page}
			{#if typeof page === 'number'}
				<button
					class="page-button w-[32px] h-[32px] rounded-md text-sm font-medium border border-transparent hover:border-white/20"
					class:selected={currentPage === page}
					onclick={() => changePage(page)}
				>
					{page}
				</button>
			{:else}
				<div class="w-[32px] h-[32px] flex items-center justify-center">
					<span class="text-gray-500">...</span>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Next button -->

	<button
		class="pagination-nav-button w-[32px] h-[32px] flex items-center justify-center"
		class:disabled={currentPage === totalPages}
		disabled={currentPage === totalPages}
		onclick={() => changePage(currentPage + 1)}
	>
		<div class="rotate-180">
			<img src="/icons/left-pagination.svg" alt="icon" />
		</div>
	</button>
</div>

<style>
	.pagination-nav-button {
		/* @apply px-5 py-2 rounded-full border border-[#414141] disabled:opacity-50 transition-all duration-200 cursor-pointer text-white bg-[#2C2C2C] font-mono font-medium inline-flex items-center gap-x-2 text-sm; */
	}

	.pagination-nav-button.disabled {
		opacity: 0.4;
	}

	.page-button.selected {
		/* @apply border border-orange-500; */
		background-color: #232323;
	}
</style>
