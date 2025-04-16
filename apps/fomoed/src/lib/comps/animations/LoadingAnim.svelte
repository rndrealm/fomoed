<script lang="ts">
	import * as rive from '@rive-app/canvas';

	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const r = new rive.Rive({
			src: '/anims/character_anim_loading.riv',
			canvas: canvas,
			autoplay: true,
			onLoad: () => {
				r.resizeDrawingSurfaceToCanvas();
			}
		});
	});
</script>

<canvas bind:this={canvas} class="w-full" height="100"></canvas>
