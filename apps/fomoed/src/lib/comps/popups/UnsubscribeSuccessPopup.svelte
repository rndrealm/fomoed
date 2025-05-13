<script lang="ts">
	import PopupContainer from '$lib/comps/PopupContainer.svelte';
	import MainButton from '$lib/comps/buttons/MainButton.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<PopupContainer>
	<div class="p-[30px]">
		<div class="flex justify-center">
			<img src="/images/icon.png" width={120} height={120} alt="Fomoed Icon." />
		</div>

		<div class="font-paralucent-demibold text-[#FFFFFFCC] text-[24px] pt-[20px] text-center">
			Successful Unsubscribe
		</div>
		<div class="text-[#FFFFFFCC] pt-[15px] text-center">
			We will stop send billing from now on. Thank you!
		</div>

		<div class="pt-[36px]">
			<div class="flex gap-x-[20px] h-[45px]">
				<MainButton on:click={() => dispatch('click-close')}>Close</MainButton>
			</div>
		</div>
	</div>
</PopupContainer>
