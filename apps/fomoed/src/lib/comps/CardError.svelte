<script lang="ts">
	let props = $props();
</script>

<div class="font-semibold text-lg opacity-50 text-center h-full grid place-items-center">
	Something went wrong :( <br />{@render props.children()}
</div>
