<script lang="ts">
	import {
		copy_social_link,
		get_data_color,
		get_data_index,
		get_data_label,
		success
	} from '$lib/utils';
	import TintedSecondaryButton from './TintedSecondaryButton.svelte';
	import { page } from '$app/stores';
	import { aped_score, cfgi_summary } from '$lib/stores';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import _ from 'lodash-es';
	import SocialButton from './buttons/SocialButton.svelte';
	import X from '$lib/icons/social/X.svelte';

	import { fade } from 'svelte/transition';
	import Meta from '$lib/icons/social/Meta.svelte';
	import Send from '$lib/icons/social/Send.svelte';
	import CopyV2 from '$lib/icons/social/CopyV2.svelte';
	import FearLogo from '$lib/icons/FearLogo.svelte';
	import GaugeV3 from './indicator/GaugeV3.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let onHomepage = false;
	export let prev = 0;
	export let percentage = 0;
	export let average = 0;

	$: background = 'transparent';

	$: marketSentiment = get_data_label(percentage);
	$: color = get_data_color(percentage);
	$: fomoed_score_color = get_data_color($aped_score);

	$: iconIdx = get_data_index(percentage);

	const icons = [
		'indicator-meme-4.png',
		'indicator-meme-3.png',
		'indicator-meme-2.png',
		'indicator-meme-1.png'
	];

	cfgi_summary.subscribe((data) => {
		if (!data) return;
		prev = data.previous.value;
		percentage = data.now.value;
		average = data.average.value;
	});

	// Sentiment rating
	type SentimentRating = 'bearish' | 'bullish';

	export let for_screenshot = false;

	const loading = writable(true);
	const has_voted = writable(false);
	const votes = writable<{ device_id: string; sentiment: number }[]>([]);
	const device_id = writable<string>();

	async function vote(rating: SentimentRating) {
		if (!$device_id) {
			console.log('Failed to Extract Device ID');
			return;
		}

		loading.set(true);
		const num_rating = rating == 'bearish' ? 25 : rating == 'bullish' ? 75 : 50;

		$votes.push({
			device_id: $device_id,
			sentiment: num_rating
		});

		has_voted.set(true);

		await fetch('/api/sentiment', {
			method: 'POST',
			body: JSON.stringify({
				sentiment: num_rating,
				device_id: '$device_id'
			})
		});

		await get_votes();
		loading.set(false);
	}

	async function get_votes() {
		loading.set(true);

		const site_votes = await fetch('/api/sentiment')
			.then((res) => res.json())
			.then((res) => res)
			.catch((err) => {
				console.error('Error Fetching Sentiment: ', err.toString());

				return { sentiment: [] };
			});

		// Loop through this result to determine if user has already voted

		site_votes?.sentiment?.length && votes.set(site_votes.sentiment);
		loading.set(false);
	}

	onMount(() => {
		if (for_screenshot) {
			has_voted.set(true);
			_.toNumber($page.url.searchParams.get('score'))
				? aped_score.set(_.toNumber($page.url.searchParams.get('score')))
				: aped_score.set(0);
		} else {
			if (typeof window !== 'undefined') {
				const calculated_device_id = new (window as any).DeviceUUID().get();
				device_id.set(calculated_device_id);
			}
			get_votes();
		}
	});

	async function update_mean_rating(all_votes: { device_id: string; sentiment: number }[]) {
		if (typeof window === 'undefined') return;

		let ratings_mean = 0;
		let did_vote = false;

		if (!$device_id) {
			console.log('Failed to Extract Device ID');
			return;
		}

		if (all_votes?.length) {
			ratings_mean =
				all_votes
					.map((v) => {
						if (v.device_id === $device_id) {
							has_voted.set(true);
							did_vote = true;
						}

						return v.sentiment;
					})
					.reduce((a, b) => a + b) / all_votes.length;
		}

		if (ratings_mean <= 1 && did_vote) {
			// Use CFGI
			ratings_mean = $cfgi_summary?.now.value || ratings_mean;
		}

		aped_score.set(ratings_mean);
	}

	votes.subscribe((v) => v?.length && update_mean_rating(v));
	cfgi_summary.subscribe((cfgi) => cfgi && update_mean_rating($votes));

	// Social Share
	function getLink() {
		return `${$page.url.origin}?score=${+$aped_score.toFixed(2)}`;
	}

	device_id.subscribe((id) => {
		if (id) {
			update_mean_rating($votes);
		}
	});

	let loadingIsOut = false;

	// Create a tweened store for smooth animation of the gradient intensity
	let scaleValue = 0;

	$: scaleValue = Math.min(Math.max(0.75 + (percentage / 100) * 0.25, 0.75), 1);
</script>

<div style:background class="w-full h-full {onHomepage ? 'rounded-[30px]' : 'rounded-[26px]'} ">
	<div class="flex flex-col flex-1 h-full">
		<div class="relative w-full mb-14">
			<div class="relative flex items-center justify-center">
				<GaugeV3 percentage={$cfgi_summary ? percentage : 0} />
			</div>

			<div class="absolute inset-x-0 flex items-center justify-center -bottom-[80px]">
				<div class="relative">
					<div class="relative flex justify-center py-[12px] pl-[12px] pr-[8px]">
						<div
							class="absolute top-0 left-0 w-full h-full test_gradient"
							style="transform: scale({scaleValue}); transition: transform 3s ease; transition-delay: 0.5s;"
							class:opacity-0={!percentage}
						></div>
						<div class="relative">
							<FearLogo />
						</div>
					</div>

					<div
						class="text-[48px] leading-[40px] font-mono font-normal text-white mt-6 flex justify-center"
					>
						{percentage}
					</div>
					<div
						class="flex justify-center mt-1 text-sm font-semibold text-white uppercase font-inter"
					>
						{marketSentiment}
					</div>
				</div>
			</div>

			<div
				class="flex justify-between duration-500 max-w-[290px] w-full mx-auto absolute inset-x-0 -bottom-14"
				class:opacity-0={!$cfgi_summary}
			>
				<div>
					<div class="text-xs font-medium">
						<h3 class="text-[10px] opacity-60">Prev</h3>
						<p class="text-base">{prev}</p>
					</div>
				</div>

				<div class="">
					<div class="text-xs font-medium">
						<h3 class="opacity-60 text-[10px]">Avg</h3>
						<p class="text-base text-right">{average}</p>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-10">
			<div class="h-[1px] bg-white opacity-10"></div>
		</div>

		<div class="flex-col mb-0 justify-evenly">
			{#if $loading}
				<div
					in:fade
					out:fade
					on:introstart={() => (loadingIsOut = false)}
					on:outroend={() => (loadingIsOut = true)}
					class="font-medium text-sm text-center mt-[20px] opacity-80"
				>
					Loading...
				</div>
			{:else if $has_voted && loadingIsOut}
				<div in:fade class="flex items-center justify-between px-9 mt-[14px]">
					<div>
						<div
							class="text-[40px] leading-[40px] font-paralucent font-medium"
							style:color={fomoed_score_color}
						>
							{~~$aped_score}
						</div>

						<div
							class="text-sm font-medium text-transparent font-paralucent max-w-max bg-gradient-to-r from-primary to-yellow bg-clip-text"
						>
							Fomoed score
						</div>
					</div>

					<div class="flex flex-col items-end gap-3">
						<div class="text-xs font-medium text-center opacity-80">Share your polls on</div>

						<div class="flex justify-center gap-x-2">
							<a href={copy_social_link('facebook', getLink())} target="_blank">
								<SocialButton>
									<Meta />
								</SocialButton>
							</a>

							<a href={copy_social_link('telegram', getLink())} target="_blank">
								<SocialButton>
									<Send />
								</SocialButton>
							</a>

							<SocialButton
								on:click={() => {
									navigator.clipboard.writeText(
										copy_social_link('copy', `${$page.url.origin}?score=${+$aped_score.toFixed(2)}`)
									);
									success('Success: Copied Share Link to Clipboard');
									return;
								}}
							>
								<CopyV2 />
							</SocialButton>
							<a href={copy_social_link('twitter', getLink())} target="_blank">
								<SocialButton>
									<X />
								</SocialButton>
							</a>
						</div>
					</div>
				</div>
			{:else if !$loading && !$has_voted && loadingIsOut}
				<div in:fade>
					<div class="font-medium text-sm text-center mt-[11px] opacity-80">
						How do you feel about the market today?
					</div>

					<div class="flex gap-x-[10px] justify-center mt-[14px] relative z-10">
						<div class=" relative rounded-[7px]">
							<div class="bullish_border"></div>
							<button
								disabled={$loading || $has_voted}
								on:click={() => vote('bearish')}
								class="relative rounded-[7px] px-6 py-[10px] bg-[#0E0E0E]"
							>
								<p class="text-[13px] font-medium text-[#C3C3C3]">Bearish</p>
							</button>
						</div>
						<div class=" relative rounded-[7px]">
							<div class="bullish_border"></div>
							<button
								disabled={$loading || $has_voted}
								on:click={() => vote('bullish')}
								class="relative rounded-[7px] px-6 py-[10px] bg-[#0E0E0E]"
							>
								<p class="text-[13px] font-medium text-[#C3C3C3]">Bullish</p>
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
