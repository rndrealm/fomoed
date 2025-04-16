<script>
	import { Circle } from 'svelte-loading-spinners';

	export let disabled = false;
	export let loading = false;
</script>

<button
	disabled={disabled || loading}
	class="w-full enabled:active:brightness-[0.7] font-paralucent-demibold flex items-center justify-center text-white shadow-primary-button enabled:hover:bg-primary text-sm duration-150 h-[45px] px-4 py-2 rounded-[11px] bg-black bg-opacity-80 border-primary border"
	class:opacity-60={disabled}
	on:click
>
	{#if loading}
		<div class="h-5 flex items-center">
			<Circle color="white" size="1" unit="rem" />
		</div>
	{:else}
		<slot />
	{/if}
</button>
