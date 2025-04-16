<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import NewNavbar from '$lib/comps/NewNavbar/NewNavbar.svelte';
	import { Toaster } from 'svelte-5-french-toast';
	import { innerWidth } from '$lib/stores/ui';
</script>

<svelte:window bind:innerWidth={$innerWidth} />

<div class="fixed inset-x-0 top-0 z-50">
	<NewNavbar />
</div>

<ModeWatcher defaultMode="dark" />
<slot />
<Toaster />
