<script>
	export let thumbnail;
</script>

<div
	class="bg-gradient-to-b from-[#FFFFFF24] to-[#FFFFFF0A] p-px w-full h-full rounded-[25px] relative overflow-hidden brightness-75"
>
	<img src={thumbnail} width={1018} height={747} alt="Video thumbnail." class="rounded-[24.5px]" />

	<!-- <div class="absolute inset-0 bg-black/70 flex items-center justify-center">
		<img
			src="/icons/play.svg"
			width={100}
			height={100}
			alt="Play."
			class="hover:scale-105 duration-100 cursor-pointer"
		/>
	</div> -->
</div>
