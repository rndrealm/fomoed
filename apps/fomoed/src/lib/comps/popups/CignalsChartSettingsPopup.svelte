<script lang="ts">
	import PopupContainer from '$lib/comps/PopupContainer.svelte';
	import type { DropdownOption } from '$ts/types';
	import {
		availableCignalTimesteps,
		type CignalsChartOptions,
		type ParsedCignalsInstrumentArray
	} from '$lib/types';
	import MainButton from '../buttons/MainButton.svelte';
	import SecondaryButton from '../buttons/SecondaryButton.svelte';
	import { cloneDeep } from 'lodash-es';
	import Combobox from '../Combobox/Combobox.svelte';
	import toast from 'svelte-5-french-toast';
	import { Select, SelectTrigger, SelectContent, SelectItem } from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';

	let {
		origOptions,
		onSave = $bindable(),
		onCancel = $bindable(),
		availableInstruments
	}: {
		origOptions: CignalsChartOptions;
		onSave: (newOptions: CignalsChartOptions) => any;
		onCancel: () => any;
		availableInstruments: ParsedCignalsInstrumentArray;
	} = $props();

	const optionsCopy = cloneDeep(origOptions);

	// Instrument
	const instrumentOptions: DropdownOption[] = $state(
		availableInstruments
			.filter(
				(i) => i.perpetual && i.exchange === 'binance_futures' && !i.label.includes('testnet')
			)
			.toSorted((a, b) => (a.id > b.id ? 1 : -1))
			.map((instrument) => {
				const shortLabel = instrument.label.replace('Binance futures', '').replace('PERP', '');

				return {
					label: shortLabel,
					value: instrument.label.toLowerCase()
				};
			})
	);

	let selectedInstrumentOption: DropdownOption = $state(
		instrumentOptions.find((i) => i.value === origOptions.instrument.label?.toLowerCase()) ||
			instrumentOptions[0]
	);

	// Period
	const periodOptions: DropdownOption[] = availableCignalTimesteps.map((timestep) => ({
		label: timestep,
		value: timestep
	}));
	let selectedPeriodOption: DropdownOption = $state(
		periodOptions.find((option) => option.value === optionsCopy.timeInterval)!
	);

	// Price step
	let selPriceStep: number | null = $state(optionsCopy.priceStep);
	let isPriceStepValid = $derived(selPriceStep === null || selPriceStep > 0);

	let allValid = $derived(isPriceStepValid);

	// Handlers
	function onSaveLocal() {
		const selectedInstrument = availableInstruments.find(
			(i) => i.label.toLowerCase() === selectedInstrumentOption.value
		);

		if (!selectedInstrument) {
			toast.error('Invalid instrument selected');
			return;
		}

		onSave({
			instrument: selectedInstrument,
			timeInterval: selectedPeriodOption.value,
			priceStep: selPriceStep
		});
	}
</script>

<PopupContainer restrictDimensions={false} zIndex={20}>
	<div class="px-4 w-full flex flex-col h-full py-4 relative">
		<div class="font-semibold flex-shrink-0 text-lg border-b-white/10 border-b pb-2">
			Footprint chart settings
		</div>

		<div class="flex-grow pt-4 flex flex-col gap-y-4">
			<!-- Options -->
			<div class="flex flex-col flex-grow gap-y-4">
				<!-- Instrument dropdown -->
				<div>
					<div class="font-semibold pb-2 pl-1">Instrument</div>
					<div class="h-14">
						<Combobox options={instrumentOptions} bind:selectedOption={selectedInstrumentOption}
						></Combobox>
					</div>
				</div>

				<!-- Period dropdown (shadcn select) -->
				<div>
					<div class="font-semibold pb-2 pl-1">Time interval</div>
					<div class="h-14">
						<Select
							value={selectedPeriodOption.value}
							onValueChange={(val) => {
								selectedPeriodOption = periodOptions.find((option) => option.value === val)!;
							}}
							type="single"
						>
							<SelectTrigger class="w-full">
								{selectedPeriodOption.label}
							</SelectTrigger>

							<SelectContent>
								{#each periodOptions as option}
									<SelectItem value={option.value}>{option.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>
				</div>

				<!-- Price step -->
				<div>
					<div class="font-semibold pb-2 pl-1">Price interval</div>
					<div class="h-14">
						<Input
							type="number"
							class="w-full _hide-number-input-arrows"
							bind:value={selPriceStep}
							placeholder="Auto"
						/>
					</div>
				</div>

				<!-- Cancle/save changes buttons -->
				<div>
					<div class="flex justify-end gap-x-4 h-12">
						<div class="w-32">
							<SecondaryButton on:click={onCancel}>Cancel</SecondaryButton>
						</div>

						<div class="w-40">
							<MainButton on:click={onSaveLocal} disabled={!allValid}>Save Changes</MainButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div></PopupContainer
>
