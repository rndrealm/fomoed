<script lang="ts">
	import { goto } from '$app/navigation';
	import { displayLogoutPopup, mobileMenuOpen } from '$lib/stores/ui';
	import { auth_user } from '$lib/stores/user';
	import Time from 'svelte-time/Time.svelte';
	import SecondaryButton from '../buttons/SecondaryButton.svelte';
	import { active_sub } from '$lib/stores/subs';
	import BorderedProfileImage from '../BorderedProfileImage.svelte';
	import LoginButton from '../buttons/LoginButton.svelte';
	import { fade } from 'svelte/transition';
	import { ClientSubscriptionManager } from '$ts/utils/client/plans';
	import AllNewsButton from '../AllNewsButton.svelte';

	$: currentActivePlan = ClientSubscriptionManager.currentActivePlan;
</script>

<div
	class="fixed inset-0 bg-[#060302E5] z-20 backdrop-blur-md flex flex-col desktop:hidden"
	transition:fade={{ duration: 100 }}
>
	<div class="flex items-center">
		<div class="h-[75px] flex items-center">
			<img src="/fomoed2.svg" alt="" class="pl-6 h-8" />
		</div>

		<div class="flex-grow"></div>

		<button on:click={() => mobileMenuOpen.set(false)}>
			<img src="/icons/close.svg" alt="Close" class="px-4 py-5 mr-4" />
		</button>
	</div>

	{#if $auth_user}
		<div class="flex-grow flex flex-col items-center justify-center">
			<div class="pb-2 w-full px-4">
				<AllNewsButton onclick={() => ($mobileMenuOpen = false)} class="w-full" />
			</div>

			<div class="flex-grow"></div>

			<div class="flex flex-grow flex-col items-center justify-center">
				<div class="w-full max-w-32">
					<BorderedProfileImage />
				</div>

				<div class="mt-[10px] text-[32px] font-paralucent-demibold">
					{$auth_user?.username}
				</div>

				<div class="text-[18px] text-[#FFFFFF99]">
					{$auth_user?.email}
				</div>

				<div class="mt-6 w-full h-[45px] max-w-64">
					<SecondaryButton
						on:click={() => {
							mobileMenuOpen.set(false);
							goto('/plans');
						}}
					>
						Select Plan
					</SecondaryButton>
				</div>

				{#if $active_sub}
					<div class="mt-4 text-[#FFFFFF99] text-sm">
						<span>{$currentActivePlan?.name} plan </span>

						{#if $active_sub && !$active_sub.cancel_at_period_end}
							Renews <Time relative timestamp={$active_sub.current_period_end * 1000} />
						{:else if $active_sub && $active_sub.cancel_at_period_end}
							Cancels <Time relative timestamp={$active_sub.current_period_end * 1000} />
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex-grow"></div>
		</div>

		<div class="flex justify-center">
			<button
				on:click={() => displayLogoutPopup.set(true)}
				class="flex gap-x-3 text-start py-3 px-[15px] hover:bg-[#FFFFFF0D] group mb-20"
			>
				<img
					src="/icons/logout.svg"
					width={17}
					height={17}
					alt="Log out."
					class="group-active:opacity-40"
				/>

				<div class="text-sm font-switzer font-medium group-active:text-[#FFFFFFCC]">Log out</div>
			</button>
		</div>
	{:else}
		<div class="flex gap-x-4 px-4 items-center py-2">
			<AllNewsButton onclick={() => ($mobileMenuOpen = false)} class="!w-1/2" />
			<LoginButton class="!w-1/2" />
		</div>
	{/if}
</div>
