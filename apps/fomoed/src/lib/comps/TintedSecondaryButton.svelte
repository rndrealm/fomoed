<script>
	export let color;
	export let disabled = false;

	$: colorCode = color === 'red' ? '#FF3B10' : '#399F57';

	let isHovered = false;
</script>

<button
	{disabled}
	class="flex items-center justify-center text-white text-opacity-80 text-sm duration-150 w-[138px] h-[45px] px-4 py-2 rounded-[10px] bg-black bg-opacity-80 border-white border-opacity-10 border-[0.5px] font-paralucent-demibold"
	style="background-color: {isHovered ? colorCode + '1A' : '#FFFFFF26'}; border-color: {isHovered
		? colorCode + '1A'
		: '#FFFFFF1A'}; box-shadow: {isHovered ? `0px 0px 0px 5px ${colorCode}0D` : 'none'}"
	on:mouseenter={() => (isHovered = true)}
	on:mouseleave={() => (isHovered = false)}
	on:click
>
	<slot></slot>
</button>
