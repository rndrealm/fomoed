<script lang="ts">
	import Nav from '$lib/comps/Nav.svelte';
</script>

<div class="flex min-h-screen flex-col items-center justify-between mx-auto">
	<div class="absolute top-0 inset-x-auto max-w-screen-xl w-full">
		<Nav></Nav>
	</div>

	<div class="w-full min-h-screen">
		<slot />
	</div>
</div>
