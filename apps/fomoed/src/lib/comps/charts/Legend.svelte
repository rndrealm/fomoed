<script lang="ts">
	export let legends: { color: string; label: string }[] = [];
</script>

<div class="flex flex-wrap justify-center gap-x-4 text-[#FFFFFFCC] -desktop:text-xs text-sm">
	{#each legends as legend}
		<div class="flex gap-x-2 items-center">
			<div style="background: {legend.color};" class="w-[11px] aspect-square"></div>
			<div class="font-paralucent font-medium whitespace-nowrap">{legend.label}</div>
		</div>
	{/each}
</div>
