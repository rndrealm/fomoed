<script lang="ts">
	import {
		newsFilterOpts,
		newsKindOpts,
		newsTokenOpts,
		type NewsService
	} from '$ts/client/services/NewsServiceOld.client';
	import { getContext } from 'svelte';
	import type { NewsItem } from '$ts/types';
	import NewsFilterDropdown from '../dropdowns/NewsFilterDropdown.svelte';
	import NewsKindDropdown from '../dropdowns/NewsKindDropdown.svelte';
	import BaseSearch from '../search/BaseSearch.svelte';
	import TextSkeleton from '../skeletons/TextSkeleton.svelte';
	import Funnel from '$lib/icons/Funnel.icon.svelte';
	import { fly, slide } from 'svelte/transition';
	import Time from 'svelte-time/Time.svelte';
	import { quintOut } from 'svelte/easing';
	import Heart from '$lib/icons/Heart.icon.svelte';
	import CancelIcon from '$lib/icons/CancelIcon.svelte';
	import Share from '$lib/icons/Share.icon.svelte';
	import CardError from '../CardError.svelte';
	import Youtube from 'svelte-youtube-embed';
	import Film from '$lib/icons/Film.icon.svelte';
	import SimpleBar from 'simplebar';
	import { inview } from 'svelte-inview';
	import { capitalize, fill } from 'lodash-es';
	import { browser } from '$app/environment';
	import { innerHeight, isDesktop, isMobile } from '$lib/stores/ui';
	import NewsTokenDropdown from '../dropdowns/NewsTokenDropdown.svelte';
	import { coinstats_selected_coin } from '$lib/stores';

	let {
		alwaysShowFilters: isOnAllNewsPage = false,
		autoListWrapperHeight = false,
		disableGradientEdges = false,
		hideTitle = false,
		disableFly = false,
		class: cls = ''
	}: {
		alwaysShowFilters?: boolean;
		autoListWrapperHeight?: boolean;
		disableGradientEdges?: boolean;
		hideTitle?: boolean;
		disableFly?: boolean;
		class?: string;
	} = $props();

	const newsService = getContext<NewsService>('newsService');

	const { status, error, news, hasNextPage } = newsService;

	let newsTokenSelected = $state($newsTokenOpts[0]);
	let newsFilterSelected = $state(newsFilterOpts[0]);
	let newsKindSelected = $state(newsKindOpts[0]);
	let searchValue = $state('');
	let filtersOpen = $state(false);
	let detailShownItem = $state<NewsItem | null>(null);
	let clientWidth = $state(0);

	let isDetailBullish = $derived(
		detailShownItem && detailShownItem.votes.positive > detailShownItem.votes.negative
	);

	let isDetailBearish = $derived(
		detailShownItem && detailShownItem.votes.positive < detailShownItem.votes.negative
	);

	let filterByToken = $derived(
		isOnAllNewsPage
			? { symbol: newsTokenSelected.value, name: newsTokenSelected.label }
			: $coinstats_selected_coin
	);

	function fetchNews() {
		if (!filterByToken) {
			return;
		}

		newsService.fetchNews({
			filter: newsFilterSelected.value,
			kind: newsKindSelected.value,
			currrency: filterByToken.symbol
		});
	}

	if (browser) {
		$effect(() => {
			newsService.reset();
			fetchNews();
		});
	}

	let videoId = $derived(detailShownItem?.metadata?.image?.split('/')[4]);

	function getRedGreenDotCounts(item: NewsItem | null) {
		if (!item?.votes) {
			return { red: 0, green: 0 };
		}

		const maxDots = 10;

		const red = item.votes.negative;
		const green = item.votes.positive;

		if (red + green < maxDots) {
			return { red, green };
		}

		const total = red + green;
		const redRatio = red / total;
		const greenRatio = green / total;

		return {
			red: Math.round(redRatio * maxDots),
			green: Math.round(greenRatio * maxDots)
		};
	}

	let listContainer = $state<HTMLElement>();
	let showTopGradient = $state(false);
	let simplebar: SimpleBar;

	$effect(() => {
		simplebar = new SimpleBar(listContainer as HTMLElement, {
			autoHide: false
		});

		function listScrollHandler(e: Event) {
			showTopGradient = (e.target as HTMLElement).scrollTop > 0;
		}

		simplebar.contentWrapperEl?.addEventListener('scroll', listScrollHandler);

		return () => {
			simplebar.contentWrapperEl?.removeEventListener('scroll', listScrollHandler);
			simplebar.unMount();
		};
	});

	async function fetchNextPage() {
		await newsService.fetchNextPage();
	}

	let container: HTMLElement;

	let filtersHeight = $state(0);

	// Hotfix for the height being the full end height on transition start
	let allowFullFiltersHeightSubstract = $state(false);

	// Disable page scrolling behind new detail on mobile
	$effect(() => {
		if (detailShownItem) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	});

	function getListWrapperHeight() {
		if ($isDesktop) {
			return 500;
		}

		return (
			$innerHeight -
			75 -
			110 -
			40 -
			(filtersHeight < 64 || allowFullFiltersHeightSubstract ? filtersHeight : 0)
		);
	}

	let listWrapperHeight = $derived(getListWrapperHeight());

	function onFiltersClick() {
		filtersOpen = !filtersOpen;
		setTimeout(() => (allowFullFiltersHeightSubstract = filtersOpen), 100);
	}
</script>

{#snippet statsRow(item: NewsItem | null)}
	{@const { red, green } = getRedGreenDotCounts(item)}

	<div class="items-center pt-2 flex gap-x-2 opacity-75">
		<div class="w-4">
			<Heart />
		</div>

		<div class="min-w-4 rounded text-center whitespace-pre text-sm" class:bg-skeleton={!item}>
			{#if item?.votes.liked != null}
				<span class="-ml-2 inline-block">
					{item?.votes.liked}
				</span>
			{:else}
				{' '}
			{/if}
		</div>

		{#if item?.kind === 'media'}
			<div class="w-5">
				<Film />
			</div>

			<!-- <a
				class="border-white/20 bg-white/10 border px-2 py-1 text-xs font-medium rounded mr-1 hover:border-primary"
				href={placeholderMediaUrl}
				target="_blank"
			>
				Watch
			</a> -->
		{/if}

		<div class="flex-grow"></div>

		{#if item?.votes.negative}
			<div class="text-xs text-red font-semibold">{item?.votes.negative}</div>
		{/if}

		{#if item}
			{#each new Array(red) as _}
				<div class="w-3 h-3 rounded-full bg-red"></div>
			{/each}

			{#each new Array(green) as _}
				<div class="w-3 h-3 rounded-full bg-green"></div>
			{/each}
		{/if}

		{#if item?.votes.positive}
			<div class="text-xs text-green font-semibold">{item?.votes.positive}</div>
		{/if}
	</div>
{/snippet}

{#snippet newsItem(item: NewsItem | null, onFirstInView: any)}
	<button
		use:inview={{ unobserveOnEnter: true }}
		oninview_enter={onFirstInView}
		class="py-1 group w-full text-left"
		onclick={() => (detailShownItem = item)}
	>
		<div
			class="border-white/20 -desktop:border-white/10 rounded-lg border px-4 py-6 w-full duration-200 group-hover:!duration-0 backdrop-brightness-50"
			class:cursor-pointer={item}
			class:item-bearish={item ? item.votes.negative > item.votes.positive : false}
			class:item-bullish={item ? item.votes.negative < item.votes.positive : false}
			class:item-neutral={item ? item.votes.negative === item.votes.positive : false}
		>
			<div class="flex -desktop:flex-col gap-x-4 font-paralucent desktop:items-center gap-y-2">
				<div class="flex-grow text-lg font-switzer text-white/80 relative overflow-hidden">
					{item?.title}
					<div class:absolute={item} class="inset-0 duration-500" class:opacity-0={item}>
						<TextSkeleton />
					</div>
				</div>

				<div
					class="opacity-50 min-w-32 rounded-lg desktop:text-right -desktop:text-sm -desktop:pt-1"
					class:bg-skeleton={!item}
					class:w-24={!item}
				>
					{#if item}
						<Time live timestamp={new Date(item?.published_at).getTime()} relative />
					{:else}
						<span class="whitespace-pre">
							{' '}
						</span>
					{/if}
				</div>
			</div>

			{@render statsRow(item)}
		</div>
	</button>
{/snippet}

<div
	bind:this={container}
	bind:clientWidth
	class="w-full px-8 -desktop:px-4 desktop:pb-4 relative flex flex-col overflow-hidden max-h-full {cls}"
>
	<div class="flex gap-x-2 items-center">
		{#if !hideTitle}
			<h2 class="text-[20px] flex-grow -desktop:text-2xl font-paralucent-heavy pt-5">
				{capitalize(filterByToken?.name + ' news')}
			</h2>
		{/if}

		<div class="flex-grow -desktop:hidden"></div>

		{#if isOnAllNewsPage}
			<div class="-desktop:flex-grow desktop:hidden">
				<NewsTokenDropdown bind:selected={newsTokenSelected} />
			</div>
		{/if}

		{#if isOnAllNewsPage}
			<button
				onclick={onFiltersClick}
				class="desktop:pl-2 desktop:pr-1 -desktop:px-5 hover:text-white text-transparent duration-200 desktop:pt-5 -desktop:border-white/20 -desktop:bg-white/5 -desktop:border -desktop:rounded-xl -desktop:h-14"
				class:hidden={$isDesktop}
				class:!text-white={filtersOpen && $isMobile}
			>
				<div class="w-4">
					<Funnel />
				</div>
			</button>
		{:else}
			<button
				onclick={onFiltersClick}
				class="desktop:pl-2 desktop:pr-1 hover:text-white text-transparent duration-200 pt-5"
				class:!text-white={filtersOpen && $isMobile}
			>
				<div class="w-4">
					<Funnel />
				</div>
			</button>
		{/if}
	</div>

	{#if filtersOpen || (isOnAllNewsPage && $isDesktop)}
		<div
			class="flex gap-x-2 gap-y-2 pt-2 desktop:pb-3 desktop:border-b border-white/20 flex-wrap mx-auto w-full"
			style="max-width: var(--max-filters-width);"
			transition:slide={{ duration: $isMobile && isOnAllNewsPage ? 0 : 300 }}
			bind:clientHeight={filtersHeight}
		>
			<div class="flex-grow -desktop:hidden">
				<BaseSearch bind:value={searchValue} />
			</div>

			<div class="desktop:w-40 -desktop:flex-grow -desktop:hidden">
				<NewsTokenDropdown bind:selected={newsTokenSelected} />
			</div>

			<div class="desktop:w-40 -desktop:flex-grow">
				<NewsFilterDropdown bind:selected={newsFilterSelected} />
			</div>

			<div class="desktop:w-40 -desktop:flex-grow">
				<NewsKindDropdown bind:selected={newsKindSelected} />
			</div>
		</div>
	{/if}

	<div
		class="grid overflow-hidden w-full mt-2 relative flex-grow flex-shrink mx-auto"
		style="height: {autoListWrapperHeight
			? 'auto'
			: listWrapperHeight + 'px'}; max-width: var(--max-list-width)"
	>
		{#if $status === 'error'}
			<CardError>{$error}</CardError>
		{:else}
			<div
				id="list-container"
				bind:this={listContainer}
				class="no-scrollbar"
				style="overflow-y: scroll;"
			>
				{#each [...$news, ...($hasNextPage ? fill(new Array(4), null) : [])] as item, index}
					{@render newsItem(
						item,
						index === $news.length ? () => $news.length && fetchNextPage() : null
					)}
				{/each}

				{#if !$hasNextPage}
					<div class="text-center text-white opacity-50 py-32 text-lg font-semibold">
						No more news
					</div>
				{/if}
			</div>

			{#if !disableGradientEdges}
				<div
					class="absolute top-0 w-full h-8 bg-gradient-to-t from-transparent to-[#0F0D0D] duration-200 -desktop:hidden"
					class:opacity-0={!showTopGradient}
				></div>

				<div
					class="absolute bottom-0 w-full h-12 bg-gradient-to-b from-transparent to-[#0F0D0D] -desktop:to-[#1f0803]"
				></div>
			{/if}
		{/if}
	</div>

	<!-- Detail overlay -->
	{#if detailShownItem}
		<div
			id="detail-container"
			class="absolute -desktop:fixed -desktop:z-40 inset-0 backdrop-blur-3xl backdrop-brightness-90 -desktop:backdrop-brightness-75 p-12 -desktop:px-2 -desktop:pt-4"
			class:bullish={isDetailBullish}
			class:bearish={isDetailBearish}
			transition:fly={{
				x: disableFly ? 0 : clientWidth,
				duration: 600,
				opacity: disableFly ? 0 : 1,
				easing: quintOut
			}}
		>
			<button
				class="z-10 active:brightness-50 items-center duration-100 absolute top-12 -desktop:top-4 right-12 -desktop:right-2 p-2 border-white/10 border rounded-lg bg-white/10 -desktop:bg-white/5"
				onclick={() => (detailShownItem = null)}
			>
				<div class="h-5 w-5">
					<CancelIcon />
				</div>
			</button>

			<div
				data-simplebar
				class="overflow-y-scroll h-full max-w-prose mx-auto pr-6 translate-x-3 no-scrollbar"
			>
				<div class="flex gap-x-4">
					<div
						class="font-paralucent-heavy text-4xl text-white/80 -desktop:mr-10 -desktop:text-2xl"
					>
						{detailShownItem.title}
					</div>
				</div>

				<div class="pt-2 opacity-60 flex">
					<div>
						<a href={'https://' + detailShownItem.source.domain} class="underline" target="_blank">
							{detailShownItem.source.domain}
						</a>
					</div>

					<div class="flex-grow"></div>

					<div class="flex items-center gap-x-2">
						<a href={detailShownItem.url} class="underline" target="_blank">Share</a>

						<div class="w-4">
							<Share />
						</div>
					</div>
				</div>

				{#if detailShownItem.kind === 'media'}
					<div class="mt-4">
						<Youtube id={videoId} animations={false} />
					</div>
				{/if}

				<div
					class="mt-4 whitespace-pre-wrap overflow-hidden leading-loose font-serif desktop:text-lg text-white/90 -desktop:text-xl select-all"
					class:text-justify={detailShownItem.domain !== 'youtube.com'}
				>
					{detailShownItem.metadata?.description}
				</div>

				{@render statsRow(detailShownItem)}
			</div>
		</div>
	{/if}
</div>

<style>
	.item-bullish {
		@apply bg-green bg-opacity-10 group-hover:bg-opacity-20;
	}

	.item-bearish {
		@apply bg-red bg-opacity-10 group-hover:bg-opacity-20;
	}

	.item-neutral {
		@apply bg-white/5 group-hover:bg-white/10;
	}

	#detail-container.bullish {
		@apply bg-green bg-opacity-5;
	}

	#detail-container.bearish {
		@apply bg-red bg-opacity-5;
	}

	#list-container :global(.simplebar-vertical) {
		@apply opacity-0;
	}

	#list-container :global(.simplebar-content-wrapper) {
		@apply desktop:overscroll-contain;
	}
</style>
