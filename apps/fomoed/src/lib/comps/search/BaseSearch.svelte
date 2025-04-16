<script lang="ts">
	import SearchIcon from '$lib/icons/SearchIcon.svelte';

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		onSubmit
	}: { value: string; placeholder?: string; onSubmit?: (value: string) => any } = $props();

	let inputEl: HTMLInputElement;
</script>

<div
	class="flex items-center gap-x-2.5 border rounded-xl border-white/20 px-[14px] w-full bg-white/5 focus-within:bg-[#FBFBFB1A] enabled:hover:border-white/30 duration-100"
>
	<div class="w-5 flex-shrink-0">
		<SearchIcon />
	</div>

	<input
		type="text"
		bind:value
		bind:this={inputEl}
		class="bg-transparent py-[15px] outline-none flex-shrink flex-grow opacity-50"
		{placeholder}
		onkeydown={(e) => {
			if (e.key === 'Enter') {
				onSubmit?.(value);
				inputEl.blur();
			}
		}}
		disabled
	/>
</div>
