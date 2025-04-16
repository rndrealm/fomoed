<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';

	export let container: HTMLElement;
	export let vertical = false;
	export let pages: number;
	export let page = 0;

	function onScroll() {
		let pageSize: number;

		if (vertical) {
			pageSize = container.scrollHeight / pages;
			page = ~~(container.scrollTop / pageSize + 0.5);
		} else {
			pageSize = container.scrollWidth / pages;
			page = ~~(container.scrollLeft / pageSize + 0.5);
		}
	}

	onMount(async () => {
		await tick();

		container.addEventListener('scroll', onScroll);
	});

	onDestroy(() => {
		container?.removeEventListener('scroll', onScroll);
	});
</script>

<div class="flex gap-[3px] justify-center w-full items-center" class:flex-col={vertical}>
	{#each Array(pages) as _, i}
		<div class:selected={page === i} class="_dot"></div>
	{/each}
</div>

<style>
	._dot {
		@apply duration-300 snap-always;
		width: 4px;
		height: 4px;
		background-color: #ffffff80;
		border-radius: 2px;
	}

	._dot.selected {
		background-color: #fff;
		width: 9px;
		height: 4px;
	}

	.flex-col ._dot.selected {
		width: 4px;
		height: 9px;
	}
</style>
