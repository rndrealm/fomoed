<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import MainButton from '../buttons/MainButton.svelte';
	import SecondaryButton from '../buttons/SecondaryButton.svelte';

	import PopupContainer from '../PopupContainer.svelte';

	const dispatch = createEventDispatcher();
</script>

<PopupContainer>
	<div class="p-[30px]">
		<div class="flex justify-center">
			<img src="/images/indicator-meme-3.png" width={160} height={160} alt="A sad guy." />
		</div>

		<div class="font-paralucent-demibold text-[#FFFFFFCC] text-[24px] pt-[20px] text-center">
			Sign out from FOMOED
		</div>
		<div class="text-[#FFFFFFCC] pt-[15px] text-center">Are your sure want to log out?</div>

		<div class="pt-[36px]">
			<div class="flex gap-x-[20px] h-[45px]">
				<SecondaryButton on:click={() => dispatch('sign-out')}>Confirm</SecondaryButton>
				<MainButton on:click={() => dispatch('cancel')}>Cancel</MainButton>
			</div>
		</div>
	</div>
</PopupContainer>
