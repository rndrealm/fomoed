<script lang="ts">
	import { random, sum } from 'lodash-es';
	import { fade } from 'svelte/transition';

	let {
		totalWidth = 600,
		show = true,
		skeleton = undefined,
		absolute = false,
		wrap = true,
		...props
	}: {
		totalWidth?: number;
		class?: string;
		show?: boolean;
		absolute?: boolean;
		skeleton?: boolean;
		wrap?: boolean;
	} = $props();

	const widths: number[] = [];

	while (sum(widths) < totalWidth) {
		widths.push(random(20, 120));
	}
</script>

{#if (show && skeleton !== false) || skeleton}
	<div
		class="flex gap-2 inset-0 items-center animate-pulse max-w-full overflow-hidden {props.class}"
		class:absolute
		class:flex-wrap={wrap}
		out:fade={{ duration: 500 }}
	>
		{#each widths as w}
			<div class="bg-white/10 rounded-md whitespace-pre" style="width: {w}px;">{' '}</div>
		{/each}
	</div>
{/if}
