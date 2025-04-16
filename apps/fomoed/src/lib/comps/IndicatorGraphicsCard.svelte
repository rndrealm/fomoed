<script>
	import { enableXmas } from '$ts/utils/client/ui';

	export let percentage = 0;
</script>

<div
	class="w-[157px] h-[159px] bg-gradient-to-b from-[#FFFFFF24] to-[#FFFFFF0A] p-px rounded-[20px]"
>
	<div
		class="bg-[#0F0F0F99] grid place-items-center h-full rounded-[18.5px] backdrop-blur-xl relative"
	>
		<img
			src="/images/indicator-meme-5.png"
			width={93}
			height={125}
			alt="A graphics of person with an emotion based on the index value."
		/>

		{#if enableXmas}
			<div
				style="background-image: url(/images/xmas/hat.svg); aspect-ratio: 97/59;"
				class="absolute -top-2 inset-x-4 -translate-x-3"
			></div>
		{/if}
	</div>
</div>
