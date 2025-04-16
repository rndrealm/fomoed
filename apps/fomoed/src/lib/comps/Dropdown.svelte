<script lang="ts">
	import { writable } from 'svelte/store';

	export let logo_field: string = 'logo';
	export let name_field: string = 'name';
	export let color_field: string = 'color';
	export let items: any[];
	export let selected_item: any;
	export let undefined_selected_item = 'Select';
	export let has_search = true;
	export let search_fields: string[] = [];
	export let active_items: string[] = [];
	export let active_field: string;

	const showDropDown = writable(false);
	const search_str = writable('');

	const clickoutside = (e: any) => {
		!e.target.closest('.token_list_dropdown') && showDropDown.set(false);
	};
</script>

<svelte:window on:click={clickoutside} />

<div class="relative rounded-lg token_list_dropdown {$$props.class}">
	<button
		class="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center flex space-x-3 items-center justify-between relative"
		style={`background-color: #${selected_item ? selected_item[color_field] : 'f07d2a'}80`}
		type="button"
		on:click={() => showDropDown.set(!$showDropDown)}
	>
		{#if selected_item}
			<div
				class="w-5 h-5 pr-4 bg-center bg-no-repeat bg-cover rounded-full"
				style="background-image: url('{selected_item?.[logo_field]}')"
			/>
			<div>
				{selected_item?.[name_field]}
			</div>
		{:else}
			<div>
				{undefined_selected_item}
			</div>
		{/if}
		<svg
			class="w-2.5 h-2.5 ms-3"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 10 6"
		>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m1 1 4 4 4-4"
			/>
		</svg>
	</button>

	<!-- Dropdown menu -->
	<div
		class:hidden={!$showDropDown}
		class="absolute left-0 z-10 rounded-lg shadow top-[120%] w-44 bg-background max-h-60"
		data-simplebar
	>
		<ul
			class="relative w-full text-sm text-gray-200 divide-y rounded-b-lg overflow-clip divide-zinc-900"
			aria-labelledby="dropdownDefaultButton"
		>
			{#if has_search}
				<li class="sticky top-0 z-10 p-0 m-0 bg-black overflow-clip">
					<div
						class="inline-flex items-center w-full space-x-4 text-left bg-black hover:bg-gray-600 hover:text-white"
					>
						<input
							type="search"
							placeholder="Search"
							name="search_dropdown"
							class="w-full h-full px-4 py-3 text-white bg-black outline-none"
							bind:value={$search_str}
						/>
					</div>
				</li>
			{/if}
			{#each items.filter((tk) => ($search_str?.length ? search_fields.some((field) => {
							if (typeof tk[field] === 'string') {
								return tk[field].toLowerCase().includes($search_str.toLowerCase());
							}

							return false;
						}) : true)) as item}
				<li>
					<button
						class="inline-flex items-center w-full px-4 py-2 space-x-4 text-left hover:bg-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
						on:click={() => {
							selected_item = item;
							showDropDown.set(false);
						}}
						disabled={!active_items.includes(item[active_field])}
					>
						<div
							class="w-5 h-5 bg-center bg-no-repeat bg-cover rounded-full"
							style="background-image: url('{item[logo_field]}')"
						/>
						<div>
							{item[name_field]}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
