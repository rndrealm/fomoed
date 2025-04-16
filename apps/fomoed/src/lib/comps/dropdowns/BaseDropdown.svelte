<script lang="ts">
	import DropdownArrow from '$lib/icons/DropdownArrow.svelte';

	type Option = { label: string; value: string; icon?: string | null };

	interface Props {
		options: Option[];
		selected: Option;
	}

	let { options, selected = $bindable(options[0]) }: Props = $props();

	let expanded = $state(false);

	let imagesLoaded: boolean[] = $state([]);
</script>

<div class="relative">
	<button
		onclick={() => (expanded = !expanded)}
		class="flex items-center overflow-hidden gap-x-2 border rounded-xl border-white/20 px-[14px] py-[15px] w-full bg-white/5 active:bg-[#FBFBFB1A] hover:border-white/30 duration-100"
	>
		<div
			class="font-medium font-paralucent flex-grow text-left pl-1 whitespace-nowrap flex items-center gap-x-2 max-w-5/6 truncate"
		>
			{#if selected.icon}
				<img src={selected.icon} width={21} height={21} alt={selected.label} />
			{/if}

			<div class="truncate">
				{selected.label}
			</div>
		</div>

		<div class:rotate-180={expanded} class="duration-200 flex-shrink-0">
			<DropdownArrow></DropdownArrow>
		</div>
	</button>

	{#if expanded}
		<div
			class="absolute top-0 translate-y-16 border border-[#FFFFFF1A] bg-white/10 backdrop-brightness-50 rounded-xl w-full overflow-hidden z-20 backdrop-blur-md"
		>
			<div class="h-full max-h-[320px]" data-simplebar>
				{#each options as option, index}
					<div class="max-w-full overflow-x-hidden">
						<button
							onclick={() => {
								selected = option;
								expanded = false;
							}}
							class="py-2.5 hover:bg-[#ffffff22] font-semibold pl-3 pr-1 w-full text-left flex items-center gap-x-2"
						>
							{#if option.icon}
								<div class="w-5 h-5 rounded-full overflow-hidden bg-white/20">
									<img
										onload={() => (imagesLoaded[index] = true)}
										src={option.icon}
										alt={option.label}
										class:opacity-0={!imagesLoaded[index]}
										class="duration-200"
									/>
								</div>
							{/if}
							{option.label}
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
