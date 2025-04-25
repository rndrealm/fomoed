<script>
	export let disabled = false;
</script>

<button
	{disabled}
	on:click
	class="duration-100 hover:bg-[#FBFBFB1A] hover:border-[#FFFFFF1A] border-[#FFFFFF1A] bg-[#070707] border rounded-[6px] grid place-items-center h-[34px] w-[34px] active:brightness-75 disabled:opacity-50"
>
	<slot />
</button>
