<script lang="ts">
	import SecondaryButton from './buttons/SecondaryButton.svelte';
	import { goto } from '$app/navigation';
	import { auth_email, auth_user } from '$lib/stores/user';
	import Time from 'svelte-time/Time.svelte';
	import { active_sub } from '$lib/stores/subs';
	import BorderedProfileImage from './BorderedProfileImage.svelte';
	import { displayLogoutPopup } from '$lib/stores/ui';
	import { ClientSubscriptionManager } from '$ts/utils/client/plans';

	let { absolute = true } = $props();

	let currentActivePlan = $derived(ClientSubscriptionManager.currentActivePlan);
</script>

<div
	class="w-[200px] h-[260px] bg-[#0F0D0DE5] border-[#FFFFFF1A] rounded-[10px] pt-[17px] flex flex-col items-center right-0 top-0 border backdrop-blur-lg z-40"
	class:absolute
>
	<div class="w-[62px]">
		<BorderedProfileImage />
	</div>

	<div class="pt-[6px] text-[18px] font-paralucent-demibold text-white">
		{$auth_user?.username || $auth_email?.substring(0, 8) + '...'}
	</div>
	<div class="text-[#FFFFFF99] text-xs">{$auth_email}</div>

	<div class="pt-4">
		<div class="h-[40px]">
			<SecondaryButton on:click={() => goto('/plans')}>
				<span class="text-xs">Select Plan</span>
			</SecondaryButton>
		</div>
	</div>

	{#if $active_sub}
		<div class="pt-[9px] text-[10px] text-[#FFFFFF99] mt-1">
			<span>{$currentActivePlan?.name} plan </span>

			{#if $active_sub && !$active_sub.cancel_at_period_end}
				Renews <Time relative timestamp={$active_sub.current_period_end * 1000} />
			{:else if $active_sub && $active_sub.cancel_at_period_end}
				Cancels <Time relative timestamp={$active_sub.current_period_end * 1000} />
			{/if}
		</div>
	{/if}

	<div class="flex-grow"></div>

	<button
		onclick={() => displayLogoutPopup.set(true)}
		class="flex gap-x-3 text-start w-full py-3 px-[15px] hover:bg-[#FFFFFF0D] group"
	>
		<img
			src="/icons/logout.svg"
			width={17}
			height={17}
			alt="Log out."
			class="group-active:opacity-40"
		/>

		<div class="text-xs font-switzer font-medium text-[#FFFFFF99] group-active:text-[#FFFFFF66]">
			Log out
		</div>
	</button>
</div>
