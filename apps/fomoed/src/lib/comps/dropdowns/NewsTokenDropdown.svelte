<script lang="ts">
	import { newsTokenOpts, type NewsTokenOption } from '$ts/client/services/NewsServiceOld.client';
	import BaseDropdown from './BaseDropdown.svelte';

	let { selected = $bindable() }: { selected: NewsTokenOption } = $props();
</script>

<BaseDropdown options={$newsTokenOpts} bind:selected />
