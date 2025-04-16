<script lang="ts">
	import { enableXmas } from '$ts/utils/client/ui';
</script>

<div class="relative">
	<div
		style="background: linear-gradient( #0F0F0F, #0F0F0F) padding-box, linear-gradient(180deg, rgba(255, 59, 16, 0.3) 0%, rgba(255, 205, 132, 0.3) 56.72%, rgba(255, 255, 255, 0.18) 100%) border-box"
		class="absolute w-[350px] h-[350px] border-2 border-transparent rounded-[20px] rotate-[6.03deg] translate-y-16 -translate-x-6 scale-[0.8]"
	></div>

	<div
		style="background: linear-gradient( #0F0F0F, #0F0F0F) padding-box, linear-gradient(180deg, rgba(255, 59, 16, 0.3) 0%, rgba(255, 205, 132, 0.3) 56.72%, rgba(255, 255, 255, 0.18) 100%) border-box"
		class="absolute w-[350px] h-[350px] border-2 border-transparent rounded-[20px] rotate-[0.82deg] translate-y-6 translate-x-4 scale-90"
	></div>

	<div
		style="background: linear-gradient( #0F0F0F, #0F0F0F) padding-box, linear-gradient(90deg, #FF3B10 0%, #F3C111 71.5%) border-box"
		class="w-[350px] h-[350px] border-[1.5px] border-transparent rounded-[20px] rotate-[-7.12deg] overflow-hidden"
	>
		<img
			src="/images/trouble.png"
			width={350}
			height={350}
			alt="A guy sitting at a bar with a sad face."
			class="scale-[101%]"
		/>
	</div>

	{#if enableXmas}
		<div
			style="background-image: url(/images/xmas/lights-right.png);"
			class="absolute top-0 inset-x-0 h-24 bg-center bg-cover scale-125 -rotate-45 -translate-x-20 translate-y-1"
		></div>
	{/if}

	<!-- <div
		class="flex opacity-50 justify-center absolute bottom-0 translate-y-24 inset-x-0 items-center gap-x-2 -desktop:hidden"
	>
		<img src="/icons/swipe-up.svg" width={25} height={25} alt="Swipe up icon." class="opacity-80" />
		<div class="text-xs opacity-80">More meme? Swipe up!</div>
	</div> -->
</div>
