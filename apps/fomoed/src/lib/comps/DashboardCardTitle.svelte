<script>
	export let title = '';
	export let subtitle = '';
</script>

<div class="flex-grow -desktop:pl-1 flex flex-col justify-center h-14">
	<div class="font-paralucent-heavy text-[20px] -desktop:text-base uppercase">
		{title}
	</div>

	<div class="font-paralucent font-medium text-lg text-[#FFFFFFCC] -desktop:text-xs">
		{subtitle}
	</div>
</div>
