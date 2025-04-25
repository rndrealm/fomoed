<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { cfgiDataService } from '$ts/client/services/CfgiDataService.client.svelte';

	let { value = $bindable() } = $props<{ value: string }>();

	$inspect(cfgiDataService.availableSymbols);

	// Display the name of the selected symbol or a default message
	// const triggerContent = $derived.by(() => {
	// 	const symbolName = cfgiDataService.availableSymbols.find((s) => s.symbol === value)?.name;

	// 	if (symbolName) {
	// 		return '$' + symbolName.toUpperCase();
	// 	}

	// 	return 'Select an asset';
	// });
	console.log(cfgiDataService.availableSymbols);
</script>

{#key cfgiDataService.availableSymbols}
	<Select.Root type="single" bind:value>
		<Select.Trigger
			class="w-[115px] rounded-[6px] text-[#C3C3C3] font-inter font-medium text-[13px] whitespace-nowrap truncate h-[34px]"
		>
			{value}
		</Select.Trigger>

		<Select.Content class="w-[140px] h-[174px]">
			<Select.Group>
				<!-- <Select.GroupHeading>Assets</Select.GroupHeading> -->

				{#each cfgiDataService.availableSymbols as symbol (symbol.symbol)}
					<Select.Item value={symbol.symbol} label={symbol.name} />
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
{/key}
