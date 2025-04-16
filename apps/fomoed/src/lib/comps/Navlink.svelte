<script>
	export let href;
</script>

<a
	{href}
	class="uppercase text-white text-opacity-50 hover:text-opacity-80 hover:after:opacity-100 duration-200 relative"
>
	<slot />
</a>

<style>
	a::after {
		@apply w-full h-0.5 block bg-primary absolute opacity-0 duration-500;
		content: '';
	}
</style>
