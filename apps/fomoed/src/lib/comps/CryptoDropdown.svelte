<script lang="ts">
	import SearchIcon from '$lib/icons/SearchIcon.svelte';
	import {
		coinstats_coin_list,
		coinstats_selected_coin,
		free_tokens,
		type CoinstatsCoinListItem
	} from '$lib/stores';
	import { auth_user } from '$lib/stores/user';
	import { derived, writable } from 'svelte/store';

	let isOpen = false;

	export let selected: CoinstatsCoinListItem | null = null;

	// This is a hotfix to prevent setting the same value multiple times
	$: if (selected && $coinstats_selected_coin !== selected) {
		coinstats_selected_coin.set(selected);
	}

	coinstats_coin_list.subscribe((value) => {
		if (!selected && value) {
			selected = value[0];
		}
	});

	let enabledSymbols: string[] = free_tokens;

	$: if ($coinstats_coin_list) {
		enabledSymbols =
			$auth_user && $auth_user?.has_valid_sub
				? $coinstats_coin_list.map((t) => t.symbol)
				: free_tokens;
	}

	let showSearch = true;

	const searchTerm = writable('');

	const filteredCoinList = derived(
		[coinstats_coin_list, searchTerm],
		([$coinstats_coin_list, $searchTerm]) => {
			if (!$searchTerm) return $coinstats_coin_list;

			return $coinstats_coin_list.filter(
				(coin) =>
					coin.name.toLowerCase().includes($searchTerm.toLowerCase()) ||
					coin.symbol.toLowerCase().includes($searchTerm.toLowerCase())
			);
		}
	);
</script>

<div class="relative h-[50px]">
	<button
		on:click={() => (isOpen = !isOpen)}
		class="border-[#FFFFFF1A] duration-150 border rounded-[11px] px-[14px] h-full flex items-center text-[#FFFFFFCC] w-[140px] hover:bg-[#FFFFFF0D] hover:border-[#FFFFFF4D]"
	>
		<img
			src={selected?.icon || 'https://static.coinstats.app/coins/1650455588819.png'}
			width={21}
			height={21}
			alt={selected?.name || 'Bitcoin'}
		/>

		<div class="pl-2 font-paralucent font-medium flex-grow text-left truncate">
			{selected?.name || 'Bitcoin'}
		</div>

		<img
			src="/icons/dropdown-arrow-up.svg"
			width={12}
			height={9}
			alt=""
			class="duration-100 ml-[7px] flex-shrink-0"
			class:rotate-180={isOpen}
		/>
	</button>

	<div
		class:hidden={!isOpen}
		class="absolute top-16 -desktop:top-14 bg-[#0F0D0DE5] border-[#FFFFFF1A] border rounded-[10px] h-[260px] desktop:w-[200px] overflow-hidden flex flex-col backdrop-blur-sm"
	>
		<div class="flex items-center pr-3">
			<div
				class="text-[#FFFFFFCC] py-[10px] pl-[13px] text-start text-sm -desktop:text-xs flex-grow select-none"
			>
				Select a Network
			</div>

			<button
				on:click={() => (showSearch = !showSearch)}
				class="w-4 h-4 opacity-50 hover:opacity-100 duration-200"
			>
				<SearchIcon />
			</button>
		</div>

		{#if showSearch}
			<input
				type="text"
				class="flex-grow-0 bg-[#0F0D0D] w-full text-[#FFFFFFCC] font-medium placeholder-[#FFFFFF4D] text-sm -desktop:text-xs px-4 outline-none py-2"
				placeholder="Search..."
				bind:value={$searchTerm}
			/>
		{/if}

		<div class="h-px bg-[#FFFFFF1A]"></div>

		<div class="overflow-y-scroll overflow-x-hidden w-full no-scrollbar">
			{#each $filteredCoinList || [] as item}
				<button
					on:click={() => {
						selected = item;
						isOpen = false;
					}}
					class="flex items-center gap-x-3 text-[#FFFFFFCC] disabled:opacity-40 enabled:hover:bg-[#FFFFFF0D] hover:text-[#FFFFFFCC] w-full py-3 px-[15px] h-[37px] font-medium -desktop:text-xs"
					disabled={!enabledSymbols.includes(item.symbol)}
				>
					<img src={item.icon} width={21} height={21} alt={item.name} />
					<div class="truncate">{item.name}</div>
				</button>
			{/each}
		</div>

		<div class="flex-grow"></div>
	</div>
</div>
