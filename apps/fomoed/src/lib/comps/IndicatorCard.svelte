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
	import Facebook from '$lib/icons/social/Facebook.svelte';
	import Telegram from '$lib/icons/social/Telegram.svelte';
	import Copy from '$lib/icons/social/Copy.svelte';
	import { fade } from 'svelte/transition';
	import LoadingAnim from './animations/LoadingAnim.svelte';
	import Gauge from './indicator/Gauge.svelte';
	import { enableXmas } from '$ts/utils/client/ui';

	export let onHomepage = false;
	export let prev = 0;
	export let percentage = 0;
	export let average = 0;

	$: background = onHomepage
		? `linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0.3) 135.93%) padding-box, linear-gradient(180deg, rgba(255, 59, 16, 0.4) -4.26%, rgba(255, 59, 16, 0) 100%) border-box`
		: 'rgba(15, 13, 13, 1)';

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
				device_id: $device_id
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
</script>

<div
	style:background
	class="w-full h-full {onHomepage
		? 'rounded-[30px]'
		: 'rounded-[26px]'} backdrop-blur-xl flex flex-col {onHomepage &&
		'border-2 border-transparent'} {!onHomepage && 'border border-[#FFFFFF1A]'}"
>
	<div class="mx-auto h-full flex flex-col">
		<div class="relative max-h-[220px] w-full">
			<div class="inset-x-0 grid place-items-center px-2 mt-4">
				<Gauge percentage={$cfgi_summary ? percentage : 0} />
			</div>

			<div class="inset-x-0 absolute bottom-4 flex justify-center items-center">
				<div class="relative">
					<img
						class:opacity-0={!$cfgi_summary}
						src="/images/{icons[iconIdx]}"
						alt=""
						class="max-w-[92px] max-h-[124px]"
					/>

					{#if enableXmas}
						<div
							style="background-image: url(/images/xmas/hat.svg); aspect-ratio: 97/59;"
							class="absolute -top-5 inset-x-0 -translate-x-3 z-30"
						></div>
					{/if}
				</div>

				{#if !$cfgi_summary}
					<div class="absolute w-full">
						<LoadingAnim />
					</div>
				{/if}
			</div>
		</div>

		<div
			class="grid grid-cols-[1fr_2fr_1fr] justify-between px-[28px] duration-500"
			class:opacity-0={!$cfgi_summary}
		>
			<div>
				<div class="text-xs opacity-60">Prev</div>
				<div class="opacity-80 font-paralucent font-medium text-[18px]">{prev}</div>
			</div>

			<div class="text-center">
				<div class="text-[40px] leading-[40px] font-paralucent font-medium" style:color>
					{percentage}
				</div>
				<div class="text-lg opacity-80 font-paralucent font-medium">{marketSentiment}</div>
			</div>

			<div class="text-right">
				<div class="text-xs opacity-60">Average</div>
				<div class="opacity-80 font-paralucent font-medium text-[18px]">{average}</div>
			</div>
		</div>

		<div class="px-[12px]">
			<div class="h-[1px] bg-white opacity-10 mt-[20px]"></div>
		</div>

		<div class="flex-grow flex flex-col mb-4 justify-evenly h-28">
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
				<div in:fade class="flex flex-col items-center">
					<div
						class="text-[40px] leading-[40px] font-paralucent font-medium mt-2"
						style:color={fomoed_score_color}
					>
						{~~$aped_score}
					</div>

					<div
						class="font-paralucent max-w-max font-medium text-sm bg-gradient-to-r from-primary to-yellow text-transparent bg-clip-text"
					>
						Fomoed score
					</div>

					<div class="font-medium text-sm text-center opacity-80">Share your polls on</div>

					<div class="flex gap-x-2 justify-center mt-[10px]">
						<a href={copy_social_link('twitter', getLink())} target="_blank">
							<SocialButton>
								<X />
							</SocialButton>
						</a>

						<a href={copy_social_link('facebook', getLink())} target="_blank">
							<SocialButton>
								<Facebook />
							</SocialButton>
						</a>

						<a href={copy_social_link('telegram', getLink())} target="_blank">
							<SocialButton>
								<Telegram />
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
							<Copy />
						</SocialButton>
					</div>
				</div>
			{:else if !$loading && !$has_voted && loadingIsOut}
				<div in:fade>
					<div class="font-medium text-sm text-center mt-[20px] opacity-80">
						How do you feel about the market today?
					</div>

					<div class="flex gap-x-[10px] justify-center mt-4 relative z-10">
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
