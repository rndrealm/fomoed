<script>
	export let title = '';
	export let subtitle = '';
</script>

<div class="flex flex-col justify-center flex-grow -desktop:pl-1 h-14">
	<div class=" text-[15px] -desktop:text-base uppercase font-semibold">
		{title}
	</div>

	<div class=" font-semibold text-[15px] text-[#737373] -desktop:text-xs">
		{subtitle}
	</div>
</div>
