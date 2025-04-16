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
</script>

{#key cfgiDataService.availableSymbols}
	<Select.Root type="single" bind:value>
		<Select.Trigger
			class="w-[140px] rounded-full font-inter font-semibold !ring-0 whitespace-nowrap truncate"
		>
			{value}
		</Select.Trigger>

		<Select.Content class="w-[140px]">
			<Select.Group>
				<!-- <Select.GroupHeading>Assets</Select.GroupHeading> -->

				{#each cfgiDataService.availableSymbols as symbol (symbol.symbol)}
					<Select.Item value={symbol.symbol} label={symbol.name} />
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
{/key}
