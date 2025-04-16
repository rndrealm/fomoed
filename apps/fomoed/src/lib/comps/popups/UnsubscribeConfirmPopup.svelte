<script lang="ts">
	import PopupContainer from '$lib/comps/PopupContainer.svelte';
	import SecondaryButton from '$lib/comps/buttons/SecondaryButton.svelte';
	import MainButton from '$lib/comps/buttons/MainButton.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let planName;
	export let monthlyFee;
</script>

<PopupContainer>
	<div class="p-[30px]">
		<div class="flex justify-center">
			<img src="/images/indicator-meme-3.png" width={160} height={160} alt="A sad guy." />
		</div>

		<div class="font-paralucent-demibold text-[#FFFFFFCC] text-[24px] pt-[20px] text-center">
			Unsubscribe from {planName} Plan
		</div>
		<div class="text-[#FFFFFFCC] pt-[15px] text-center">
			You will be unsubscribed from the {planName} plan {monthlyFee} / month?
		</div>

		<div class="pt-[36px]">
			<div class="flex gap-x-[20px] h-[45px]">
				<SecondaryButton on:click={() => dispatch('click-confirm')}>Confirm</SecondaryButton>
				<MainButton on:click={() => dispatch('click-cancel')}>Cancel</MainButton>
			</div>
		</div>
	</div>
</PopupContainer>
