<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div
	transition:fade={{ duration: 200 }}
	class="fixed w-screen h-screen grid place-items-center bg-[#06030280] backdrop-blur-sm inset-0 z-10 -desktop:px-4"
>
	<div
		class="bg-[#0F0D0D] border border-[#FFFFFF1A] grid place-items-center w-[470px] h-[420px] rounded-[20px] -desktop:w-full"
	>
		<slot />
	</div>
</div>
