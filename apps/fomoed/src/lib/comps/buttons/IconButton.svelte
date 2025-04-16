<script>
	export let disabled = false;
</script>

<button
	{disabled}
	on:click
	class="duration-100 hover:bg-[#FBFBFB1A] hover:border-[#FFFFFF1A] border-[#FFFFFF1A] bg-[#12100F] border rounded-[11px] grid place-items-center h-14 w-14 active:brightness-75 disabled:opacity-50"
>
	<slot />
</button>
