<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/shadcn/utils';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	type Option = {
		label: string;
		value: string;
	};

	let {
		options,
		selectedOption = $bindable(null)
	}: { options: Option[]; selectedOption: Option | null } = $props();

	let value = $state('');
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(options.find((f) => f.value === value)?.label);

	$effect(() => {
		if (selectedOption) {
			console.log('Selected option:', selectedOption);
			value = selectedOption.value;
		}
	});

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function customFilter(commandValue: string, search: string, commandKeywords?: string[]): number {
		if (search.length < 2) {
			return 1;
		}

		return commandValue.includes(search.toLowerCase()) ? 1 : 0;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef} class="w-full">
		{#snippet child({ props })}
			<Button
				variant="outline"
				class="w-full justify-between"
				{...props}
				role="combobox"
				aria-expanded={open}
			>
				<div class="flex-grow text-left">
					{selectedValue || 'Select a symbol...'}
				</div>
				<ChevronsUpDown class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content class="w-[300px] p-0" align="start" side="bottom">
		<Command.Root filter={customFilter}>
			<Command.Input placeholder="Search symbol..." />
			<Command.List>
				<Command.Empty>No symbol found.</Command.Empty>
				<Command.Group>
					<ScrollArea class="h-[200px]">
						{#each options as option (option.value)}
							<Command.Item
								value={option.value}
								onSelect={() => {
									value = option.value;
									selectedOption = option;
									closeAndFocusTrigger();
								}}
							>
								<Check class={cn(value !== option.value && 'text-transparent')} />
								{option.label}
							</Command.Item>
						{/each}
					</ScrollArea>
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
