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
	const gradientIntensity = tweened(0.3, {
		duration: 800,
		easing: cubicOut
	});

	// Update the gradient intensity whenever percentage changes
	$: {
		gradientIntensity.set(0.3 + (percentage * 0.7) / 100);
	}
</script>

<div
	style:background
	class="w-full {onHomepage ? 'rounded-[30px]' : 'rounded-[26px]'}  flex flex-col"
>
	<div class="flex flex-col">
		<div class="relative w-full">
			<div class="relative flex items-center justify-center">
				<GaugeV3 percentage={$cfgi_summary ? percentage : 0} />
			</div>

			<div class="absolute inset-x-0 flex items-center justify-center -bottom-[70px]">
				<div class="relative">
					<div
						class="py-2 pl-2 pr-1"
						style="background: radial-gradient(49.81% 49.81% at 50% 50%, rgba(50, 15, 1, {$gradientIntensity}) 0%, rgba(25, 7, 0, {$gradientIntensity}) 100%); 
					border-radius: 50%; 
					
					backdrop-filter: blur(5.947214126586914px)"
					>
						<FearLogo />
					</div>

					<div
						class="text-[48px] leading-[40px] font-mono font-normal text-white mt-6 flex justify-center"
					>
						{percentage}
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

		<div class="hidden mt-10">
			<div class="h-[1px] bg-white opacity-10"></div>
		</div>

		<div class="flex-col hidden mb-0 justify-evenly">
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
						<TintedSecondaryButton
							disabled={$loading || $has_voted}
							on:click={() => vote('bearish')}
							color="red"
						>
							Bearish
						</TintedSecondaryButton>

						<TintedSecondaryButton
							disabled={$loading || $has_voted}
							on:click={() => vote('bullish')}
							color="green"
						>
							Bullish
						</TintedSecondaryButton>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
