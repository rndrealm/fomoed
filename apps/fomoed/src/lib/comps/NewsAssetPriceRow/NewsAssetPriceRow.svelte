<script lang="ts">
	import {
		liveDataService,
		type LiveSymbolData
	} from '$ts/client/services/LiveSymbolDataService.client.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { type SymbolData, symbols } from '.';
	import { fade } from 'svelte/transition';

	const symbolDatas = $derived.by(() => {
		const filteredSymbols: LiveSymbolData[] = [];

		for (const symbol of symbols) {
			const data = liveDataService.liveSymbolData.get(symbol);

			if (data) {
				filteredSymbols.push(data);
			}
		}

		return filteredSymbols.map((data) => ({
			id: data.symbol,
			symbol: data.symbol,
			name: data.name,
			iconUrl: data.iconUrl,
			price: data.price,
			dayDelta: data.change24h
		}));
	});

	let scrollContainer: HTMLDivElement;
	let isPaused = false;
	let animationId: number;
	let isScrollInitialized = false;

	function startAutoScroll() {
		let scrollPosition = 0;
		// Scrolling speed (adjust as needed)
		const scrollSpeed = 0.5;

		const scroll = () => {
			if (!isPaused && scrollContainer) {
				scrollPosition += scrollSpeed;

				// Seamless loop logic
				if (scrollPosition >= scrollContainer.scrollWidth / 2) {
					scrollPosition = 0; // Reset to the start of the duplicated content
				}

				scrollContainer.scrollLeft = scrollPosition;
			}
			animationId = requestAnimationFrame(scroll);
		};

		animationId = requestAnimationFrame(scroll);
		isScrollInitialized = true;
	}

	// Watch for changes to symbolDatas and start scrolling when data is available
	$effect(() => {
		if (symbolDatas.length > 0 && scrollContainer && !isScrollInitialized) {
			setTimeout(() => startAutoScroll(), 100); // Small delay to ensure DOM is ready
		}
	});

	onMount(() => {
		// Start automatic scrolling after component is mounted
		if (symbolDatas.length > 0) {
			startAutoScroll();
		}
	});

	onDestroy(() => {
		// Clean up animation frame on component destruction
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	});

	function handleMouseEnter() {
		isPaused = true;
	}

	function handleMouseLeave() {
		isPaused = false;
	}
</script>

<!-- Asset price row -->
<div
	bind:this={scrollContainer}
	class="flex h-16 mt-0 overflow-x-auto md:mt-5 gap-x-4 no-scrollbar"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	role="list"
>
	<!-- Original content -->
	{#each symbolDatas as asset (asset.id)}
		{@render assetBlock(asset)}
	{/each}

	<!-- Duplicated content for seamless looping -->
	{#each symbolDatas as asset (asset.id + '-duplicate')}
		{@render assetBlock(asset)}
	{/each}
</div>

{#snippet assetBlock(asset: SymbolData)}
	<!-- Asset block -->
	<div class="min-w-[15.875rem] flex-1 rounded-[15px] relative overflow-hidden p-[1px]" in:fade>
		<div class="gradient_border z-[1]"></div>
		<div
			class="flex relative bg-[#1C1C1C] w-full h-full py-3 px-4 rounded-[15px] justify-between font-inter z-[2]"
		>
			<div class="flex gap-[18px]">
				<!-- Asset icon -->
				<div class="flex-shrink-0">
					<img
						src={asset.iconUrl}
						alt=""
						class="object-cover w-6 h-6 bg-gray-100 rounded-full dark:bg-gray-700"
					/>
				</div>

				<!-- Symbol and name -->
				<div class="flex flex-col justify-center text-sm font-medium">
					<span class="text-gray-900 dark:text-gray-100">{asset.symbol}</span>
					<span class=" text-[#878787] truncate max-w-[80px]">{asset.name}</span>
				</div>
			</div>

			<!-- Price and day delta -->
			<div class="flex flex-col items-end justify-center">
				<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
					${typeof asset.price === 'number' ? asset.price.toFixed(2) : 'N/A'}
				</span>
				<span
					class="font-normal {`text-sm ${typeof asset.dayDelta !== 'number' ? 'text-gray-500' : asset.dayDelta >= 0 ? 'text-[#1FC16B]' : 'text-[#FB3748]'}`}"
				>
					{#if typeof asset.dayDelta === 'number'}
						{asset.dayDelta >= 0 ? '+' : '-'}{Math.abs(asset.dayDelta).toFixed(2)}%
					{:else}
						--
					{/if}
				</span>
			</div>
		</div>
	</div>
{/snippet}
