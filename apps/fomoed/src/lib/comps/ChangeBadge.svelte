<script>
	export let percentage = 0;
</script>

<div
	class="py-[2px] px-2 flex items-center justify-center gap-1.5 rounded-[5px] max-w-max {percentage <
	0
		? 'bg-[#FF3B1080]'
		: 'bg-[#47A66380]'}"
>
	<img
		src="/icons/change-arrow-down.svg"
		class:rotate-180={percentage >= 0}
		width={10}
		height={7}
		alt="Arrow down"
	/>

	{percentage}%
</div>
