<script lang="ts">
	import SecondaryButton from '../buttons/SecondaryButton.svelte';
	import { active_sub, changingSubscription } from '$lib/stores/subs';
	import Time from 'svelte-time/Time.svelte';
	import type { Readable } from 'svelte/motion';
	import type Stripe from 'stripe';
	import type { PlanInfo } from '$lib/types/index';
	import { getContext } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { goto } from '$app/navigation';
	import { auth_user } from '$lib/stores/user';
	import { ClientSubscriptionManager } from '$ts/utils/client/plans';
	import UnsubscribeConfirmPopup from '../popups/UnsubscribeConfirmPopup.svelte';
	import MainButton from '../buttons/MainButton.svelte';
	import ChristmasSaleIcon from '$lib/icons/ChristmasSaleIcon.svelte';
	import { enableXmas } from '$ts/utils/client/ui';

	export let planInfo: PlanInfo;
	export let yearlySelected: boolean;

	const supabase = getContext<SupabaseClient>('supabase');
	const subManager = new ClientSubscriptionManager(supabase);

	$: disabled = $changingSubscription;

	$: _displayedPriceId = (yearlySelected ? planInfo.priceIdYear : planInfo.priceIdMonth) as string;
	$: displayedPriceId = yearlySelected ? planInfo.priceIdYear : planInfo.priceIdMonth;

	// @ts-ignore
	$: isDisplayedPlanPriceActive = $active_sub?.plan.id === displayedPriceId;

	let showUnsubConfirm = false;
	let isLoading = false;

	function ensureLoggedIn() {
		if (!$auth_user) {
			goto('/auth');
			return false;
		}

		return true;
	}

	async function handleSub() {
		if (!ensureLoggedIn()) {
			return;
		}

		isLoading = true;

		try {
			await subManager.subscribe(_displayedPriceId);
		} finally {
			isLoading = false;
		}
	}

	async function handleUnsub() {
		showUnsubConfirm = false;

		isLoading = true;

		try {
			await subManager.unsubscribe();
		} finally {
			isLoading = false;
		}
	}

	async function handleResub() {
		isLoading = true;

		try {
			await subManager.resubscribe();
		} finally {
			isLoading = false;
		}
	}

	$: btnComp = planInfo.recommended ? MainButton : SecondaryButton;
</script>

<div
	class="_container bg-black w-[333px] rounded-[20px] flex flex-col border-transparent relative"
	class:recommended={planInfo.recommended}
>
	<div class="h-1/2 grid place-items-center text-center">
		<div>
			<div
				class="text-[28px] font-paralucent-demibold leading-[32px] bg-gradient-to-r from-primary to-yellow bg-clip-text text-transparent mt-4"
			>
				{planInfo.name}
			</div>

			<div class="text-[48px] mt-[9px] leading-[54px] font-paralucent-demibold">
				${yearlySelected || !planInfo.priceUsdMonth
					? planInfo.priceUsdYear
					: planInfo.priceUsdMonth}
			</div>

			<div class="opacity-60 font-paralucent font-medium">
				{#if yearlySelected || !planInfo.priceUsdMonth}
					/year
				{:else}
					/month
				{/if}
			</div>

			<div class="pt-[12px] opacity-60 text-sm font-paralucent font-medium">
				{#if $active_sub && isDisplayedPlanPriceActive && !$active_sub.cancel_at_period_end}
					Renews <Time relative timestamp={$active_sub.current_period_end * 1000} />
				{:else if isDisplayedPlanPriceActive && $active_sub?.cancel_at_period_end}
					Cancels <Time relative timestamp={$active_sub.current_period_end * 1000} />
				{:else if yearlySelected}
					Renews every 1 year
				{:else}
					Renews every month
				{/if}
			</div>
		</div>
	</div>

	<div class="h-px bg-[#FFFFFF33] mx-[10px]"></div>

	<ul class="px-[24px] pt-[20px] grid gap-y-[10px] text-sm mb-8">
		{#each planInfo.features as feat}
			<li class="checkmark-list-item">{@html feat}</li>
		{/each}
	</ul>

	<div class="flex-grow"></div>

	<div class="px-[20px] pb-[25px] h-20">
		{#if isDisplayedPlanPriceActive && $active_sub && !$active_sub.cancel_at_period_end}
			<svelte:component
				this={btnComp}
				loading={isLoading}
				on:click={() => (showUnsubConfirm = true)}
			>
				Unsubscribe
			</svelte:component>
		{:else if isDisplayedPlanPriceActive && $active_sub && $active_sub.cancel_at_period_end}
			<svelte:component this={btnComp} loading={isLoading} {disabled} on:click={handleResub}>
				Resubscribe
			</svelte:component>
		{:else if !isDisplayedPlanPriceActive}
			{@const text =
				$auth_user?.has_had_free_trial || !planInfo.recommended
					? 'Select Plan'
					: 'START FREE TRIAL'}
			<svelte:component this={btnComp} loading={isLoading} on:click={handleSub}>
				{text}
			</svelte:component>
		{/if}
	</div>

	{#if planInfo.recommended}
		<div class="absolute top-[-2px] inset-x-0 flex justify-center">
			<div class="px-[20px] py-[6px] bg-primary rounded-b-xl font-paralucent-demibold">
				{#if enableXmas}
					<div class="flex gap-x-1 items-center">
						<div class="w-5">
							<ChristmasSaleIcon />
						</div>

						Christmas Sale
					</div>
				{:else}
					Recommended
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if showUnsubConfirm}
	<!-- TODO Fix this 0 -->
	<UnsubscribeConfirmPopup
		planName={planInfo.name}
		monthlyFee={0}
		on:click-confirm={handleUnsub}
		on:click-cancel={() => (showUnsubConfirm = false)}
	/>
{/if}

<style>
	._container {
		@apply h-[436px] border;

		background:
			linear-gradient(#0f0f0f, #0f0f0f) padding-box,
			linear-gradient(165.22deg, rgba(255, 255, 255, 0.4) -12.61%, rgba(153, 153, 159, 0.1) 104.22%)
				border-box;
	}

	._container.recommended {
		@apply h-[540px] border-2;

		background:
			linear-gradient(#0f0f0f, #0f0f0f) padding-box,
			linear-gradient(163.28deg, rgba(255, 59, 16, 0.7) 0.31%, rgba(255, 255, 255, 0.3) 102.77%)
				border-box;
	}
</style>
