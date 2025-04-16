<script lang="ts">
	import { coinstats_selected_coin } from '$lib/stores';
	import { auth_user } from '$lib/stores/user';
	import { get_token_data } from '$lib/utils';
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

	function selectDuration(option: CfgiPeriodOption) {
		if ($auth_user?.has_valid_sub) {
			selected = option;
		} else {
			dispatch('show-subscription-required');
		}
	}
</script>

<div class="h-[38px] flex gap-x-[5px]">
	{#each options as opt}
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
	{/each}
</div>
