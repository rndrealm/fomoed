<script lang="ts">
	import CancelIcon from '$lib/icons/CancelIcon.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<div class="fixed inset-0 desktop:p-4 z-50 overflow-hidden">
	<div
		class="-desktop:px-2 -desktop:pb-2 -desktop:pt-14
		desktop:px-[30px] desktop:py-[22px] bg-[#0f0d0d] desktop:rounded-[26px] desktop:border border-white border-opacity-10 grid place-items-center w-full h-full relative overscroll-none"
	>
		<div class="aspect-square absolute top-4 right-4 z-10">
			<button
				class="w-8 h-8 p-1 active:brightness-50 duration-100 active:scale-90"
				on:click={() => dispatch('close')}
			>
				<CancelIcon />
			</button>
		</div>

		<div class="h-full w-full">
			<slot />
		</div>
	</div>
</div>
