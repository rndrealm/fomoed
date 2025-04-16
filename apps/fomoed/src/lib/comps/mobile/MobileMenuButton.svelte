<script lang="ts">
	import { mobileMenuOpen } from '$lib/stores/ui';
</script>

<button
	class="grid place-items-center h-full mr-6 w-full"
	on:click={() => ($mobileMenuOpen = !$mobileMenuOpen)}
>
	<img src="/icons/menu.svg" alt="" />
</button>
