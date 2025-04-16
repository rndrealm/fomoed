<script lang="ts">
	import AutocompleteSearch from '$lib/icons/AutocompleteSearch.svelte';
	import DropdownArrow from '$lib/icons/DropdownArrow.svelte';
	import { cloneDeep } from 'lodash-es';

	type Option = { label: string; value: any };

	export let options: Option[];
	export let selected: Option | null = options[0];
	export let inputValue: string = selected?.label || '';

	let hasFocus = false;
	let startedTyping = false;

	$: displayedOptions = startedTyping
		? options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))
		: cloneDeep(options);

	function toggle() {
		hasFocus = !hasFocus;
		startedTyping = false;
	}
</script>

<div
	tabindex={0}
	on:click={toggle}
	on:keydown={toggle}
	class="duration-200 relative w-full rounded-xl border-[#FFFFFF1A] border h-full pl-[14px] flex items-center gap-x-2 bg-[#12100F] hover:bg-[#FBFBFB1A] hover:border-[#FFFFFF1A] hover:cursor-pointer"
	role="button"
>
	<div class="pb-px">
		<AutocompleteSearch />
	</div>

	<input
		bind:value={inputValue}
		class="w-full bg-transparent font-paralucent font-medium text-sm outline-none placeholder-[#FFFFFF80]"
		placeholder="Search"
		on:input={() => {
			startedTyping = true;
		}}
	/>

	<div class="pr-[14px]">
		<div class:rotate-180={hasFocus} class="duration-200">
			<DropdownArrow />
		</div>
	</div>

	{#if hasFocus}
		<div
			class="absolute top-0 left-0 translate-y-16 border border-[#FFFFFF1A] bg-[#0F0D0DE5] rounded-xl w-full h-[300px]"
		>
			<div class="overflow-y-scroll py-3 h-full no-scrollbar" data-simplebar>
				{#each displayedOptions as option}
					<div>
						<button
							on:click={() => {
								selected = option;
								hasFocus = false;
								inputValue = selected.label;
							}}
							class="py-2.5 hover:bg-[#ffffff22] pl-3 pr-1 w-full text-left">{option.label}</button
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.simplebar-scrollbar)::before {
		background-color: #3e3d3d;
	}
</style>
