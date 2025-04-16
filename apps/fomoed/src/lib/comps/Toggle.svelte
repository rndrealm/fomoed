<script>
	export let state = false;
	export let labelLeft = 'Off';
	export let labelRight = 'On';
</script>

<div class="flex gap-x-3 items-center" on:pointerdown={() => (state = !state)}>
	<div class="_label" class:selected={!state}>{labelLeft}</div>

	<div class="bg-[#373737] rounded-full w-[36px] h-[14px] flex items-center">
		<div class="w-[20px] aspect-square bg-white rounded-full duration-200 _dot" class:state></div>
	</div>

	<div class="_label" class:selected={state}>{labelRight}</div>
</div>

<style>
	._label {
		@apply font-paralucent font-medium text-[#FFFFFF4D] duration-200;
	}

	._label.selected {
		@apply text-white;
	}

	._dot.state {
		@apply translate-x-full;
	}
</style>
