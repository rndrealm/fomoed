<script lang="ts">
	import { coinstats_selected_coin } from '$lib/stores';
	import { auth_user } from '$lib/stores/user';
	import { get_token_data } from '$lib/utils';
	import * as Select from '$lib/components/ui/select/index.js';
	import { CfgiPeriods, type CfgiPeriodOption } from '$lib/utils/cfgi_data';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let options = CfgiPeriods;
	export let selected = options[0];

	// Ugly hotfix
	export let autoFetchTokenData = true;

	$: if ($coinstats_selected_coin && selected && autoFetchTokenData) {
		// console.log($coinstats_selected_coin, selected, autoFetchTokenData);

		get_token_data(
			$coinstats_selected_coin.symbol,
			$coinstats_selected_coin.slug,
			selected.value,
			$coinstats_selected_coin.name
		);
	}

	// function selectDuration(option: CfgiPeriodOption) {
	// 	if ($auth_user?.has_valid_sub) {
	// 		selected = option;
	// 	} else {
	// 		dispatch('show-subscription-required');
	// 	}
	// }
	function handleSelectChange(value: string) {
		// const value = (event.target as HTMLSelectElement).value;
		const option = options.find((opt) => opt.value === value);

		if (!option) return;

		if ($auth_user?.has_valid_sub) {
			selected = option;
		} else {
			dispatch('show-subscription-required');
		}
	}
</script>

<div class="h-[34px] flex gap-x-[5px]">
	<!-- {#each options as opt}
		<button
			disabled={opt.disabled}
			on:click={() => selectDuration(opt)}
			class="font-paralucent font-light border border-[#FFFFFF1A] rounded-[11px] w-[44px] h-[38px] flex-grow {selected ===
			opt
				? 'bg-[#FFFFFF1A]'
				: ''}"
		>
			{opt.label}
		</button>
	{/each} -->
	<!-- <select
		bind:value={selected.value}
		on:change={handleSelectChange}
		class="h-full w-full font-paralucent font-light border border-[#FFFFFF1A] bg-transparent rounded-[11px] px-3 text-white appearance-none cursor-pointer"
	>
		{#each options as opt}
			<option value={opt.value} disabled={opt.disabled} class="bg-[#1E1E1E] text-white">
				{opt.label}
			</option>
		{/each}
	</select> -->
	<Select.Root value={selected.value} type="single" onValueChange={handleSelectChange}>
		<Select.Trigger
			class="w-[74px] h-full font-paralucent font-light border border-[#FFFFFF1A] bg-[#121212] rounded-[8px] px-3 text-white appearance-none cursor-pointer"
		>
			{selected.label}
		</Select.Trigger>

		<Select.Content class="bg-[#1E1E1E] border border-[#FFFFFF1A] text-white">
			<Select.Group>
				{#each options as opt}
					<Select.Item value={opt.value} disabled={opt.disabled}>
						{opt.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
