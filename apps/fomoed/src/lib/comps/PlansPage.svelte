<script lang="ts">
	import { onMount } from 'svelte';
	import PaidPlanBadge from './decorations/PaidPlanBadge.svelte';
	import FreeCard from './plan-cards/FreeCard.svelte';
	import AppNav from './AppNav.svelte';
	import UnsubscribeSuccessPopup from './popups/UnsubscribeSuccessPopup.svelte';
	import { writable } from 'svelte/store';
	import ScrollerDots from './ScrollerDots.svelte';
	import Toggle from './Toggle.svelte';
	import PaidPlanCard from './plan-cards/PaidPlanCard.svelte';
	import { ClientSubscriptionManager, planInfoPlus, planInfoPro } from '$ts/utils/client/plans';
	import { auth_user } from '$lib/stores/user';

	const showUnsubSuccess = writable(false);

	let cardsContainer: HTMLElement;

	onMount(() => {
		cardsContainer.scrollTo({ left: cardsContainer.scrollWidth / 3 });
	});

	$: isLoadingPlanInfo = !$planInfoPro && !$planInfoPlus;

	let yearlySelected = false;

	$: console.log($auth_user?.subscriptions);

	ClientSubscriptionManager.currentSubIsYearly.subscribe((isYearly) => {
		if (isYearly) {
			yearlySelected = isYearly;
		}
	});
</script>

<div
	style="background-image: url(/background/select-plan.svg)"
	class="absolute inset-0 overflow-hidden bg-cover flex flex-col"
>
	<AppNav />

	<div class="flex-grow grid place-items-center pb-24">
		<div
			class="grid place-items-center grid-cols-3 gap-[7px] mx-auto h-full pb-6 w-full max-w-[1050px] max-h-[760px]"
		>
			<div class="col-span-3 w-full">
				<h1
					class="font-paralucent-demibold text-[28px] text-center -desktop:text-[22px] -desktop:mt-12"
				>
					{#if $auth_user?.has_had_free_trial}
						Upgrade your plan to unlock more!
					{:else}
						Get your free trial to unlock more!
					{/if}
				</h1>

				<div class="mt-[9px] flex items-center justify-center gap-x-[20px]">
					<img src="/fomoed.svg" alt="Fomoed." class="w-[158px] -desktop:w-[125px]" />
					<PaidPlanBadge />
				</div>

				<!-- Monthly/Yearly switch -->
				<div
					class="grid place-items-center mt-4 desktop:place-items-end desktop:pr-3 desktop:translate-y-10 duration-200"
					class:opacity-0={isLoadingPlanInfo}
				>
					<Toggle labelLeft="Monthly" labelRight="Yearly" bind:state={yearlySelected}></Toggle>
				</div>
			</div>

			<div
				bind:this={cardsContainer}
				class="desktop:grid desktop:grid-cols-subgrid col-span-3 desktop:place-items-center -desktop:flex -desktop:overflow-x-scroll -desktop:gap-x-2 items-center -desktop:w-full -desktop:px-2 -xs:snap-x -xs:snap-mandatory no-scrollbar -desktop:mt-[18px] desktop:mt-[20px] duration-200"
				class:opacity-0={isLoadingPlanInfo}
			>
				<div class="_card-container">
					<FreeCard />
				</div>

				{#if $planInfoPro}
					<div class="_card-container">
						<PaidPlanCard planInfo={$planInfoPro} {yearlySelected} />
					</div>
				{/if}

				{#if $planInfoPlus}
					<div class="_card-container">
						<PaidPlanCard planInfo={$planInfoPlus} {yearlySelected} />
					</div>
				{/if}
			</div>
		</div>

		<div class="col-span-3 xs:hidden">
			<ScrollerDots pages={3} container={cardsContainer} />
		</div>
	</div>
</div>

{#if $showUnsubSuccess}
	<UnsubscribeSuccessPopup on:click-close={() => showUnsubSuccess.set(false)} />
{/if}

<style>
	._card-container {
		@apply flex-shrink-0 snap-center;
	}
</style>
