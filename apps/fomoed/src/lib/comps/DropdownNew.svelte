<!-- DEPRECATED, here for backwards compatibility with Svelte 4 -->
<script lang="ts">
	import DropdownArrow from '$lib/icons/DropdownArrow.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	type Option = { label: string; value: string };

	export let options: Option[];
	export let selected: Option = options[0];

	let expanded = false;
</script>

<div class="relative">
	<button
		on:click={() => (expanded = !expanded)}
		class="flex items-center gap-x-2 border rounded-xl border-[#FFFFFF1A] px-[14px] py-[15px] w-full bg-[#12100F] hover:bg-[#FBFBFB1A] hover:border-[#FFFFFF1A]"
	>
		<div class="font-medium font-paralucent flex-grow text-left pl-1 whitespace-nowrap">
			{selected.label}
		</div>

		<div class:rotate-180={expanded} class="duration-200">
			<DropdownArrow></DropdownArrow>
		</div>
	</button>

	{#if expanded}
		<div
			data-simplebar
			class="absolute top-0 translate-y-16 border border-[#FFFFFF1A] bg-[#0F0D0DE5] rounded-xl py-3 w-full max-h-[300px]"
		>
			{#each options as option}
				<div>
					<button
						on:click={() => {
							selected = option;
							expanded = false;
							dispatch('change', { selected });
						}}
						class="py-2.5 hover:bg-[#ffffff22] pl-3 pr-1 w-full text-left">{option.label}</button
					>
				</div>
			{/each}
		</div>
	{/if}
</div>
