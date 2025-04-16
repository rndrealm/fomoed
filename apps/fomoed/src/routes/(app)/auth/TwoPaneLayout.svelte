<script>
	import Fomoed2 from '$lib/comps/graphics/Fomoed2.svelte';
	import LoginRightPaneGraphics from '$lib/comps/graphics/LoginRightPaneGraphics.svelte';
	import LogoContainer from '$lib/comps/LogoContainer.svelte';
</script>

<!-- Right side -->
<div
	class="absolute right-0 inset-y-0 desktop:w-1/2 z-10 flex justify-end items-center -desktop:size-0 overflow-hidden"
>
	<div class="w-full h-full relative">
		<div
			class="absolute h-full inset-0 -desktop:inset-0 -desktop:opacity-50 grid place-items-center scale-150"
		>
			<LoginRightPaneGraphics></LoginRightPaneGraphics>
		</div>

		<div class="grid w-full h-full place-items-center z-10 relative">
			<div>
				<div class="w-96">
					<Fomoed2></Fomoed2>
				</div>
				<div class="font-mono text-2xl text-center mt-4 pl-12 font-medium">Never Miss Out</div>
			</div>
		</div>
	</div>
</div>

<!-- Left blur rectangle -->
<div
	class="bg-[#171514] bg-opacity-50 absolute inset-y-0 left-0 -desktop:right-0 desktop:w-1/2 flex justify-end items-center"
>
	<!-- Glow in the middle -->
	<svg
		width="355"
		height="832"
		viewBox="0 0 355 832"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="-desktop:hidden"
	>
		<g opacity="0.15" filter="url(#filter0_f_16_297)">
			<circle cx="495.5" cy="416.5" r="249.5" fill="#FF3B10" />
		</g>
		<defs>
			<filter
				id="filter0_f_16_297"
				x="0.199997"
				y="-78.8"
				width="990.6"
				height="990.6"
				filterUnits="userSpaceOnUse"
				color-interpolation-filters="sRGB"
			>
				<feFlood flood-opacity="0" result="BackgroundImageFix" />
				<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
				<feGaussianBlur stdDeviation="122.9" result="effect1_foregroundBlur_16_297" />
			</filter>
		</defs>
	</svg>
</div>

<div
	class="bg-no-repeat desktop:bg-cover absolute inset-0 grid desktop:w-1/2 desktop:place-items-center bg-[url(/background/login/background.svg)] -desktop:bg-[url(/background/mobile/login.svg)] -desktop:bg-[50%_50%]"
>
	<div class="desktop:hidden size-full absolute inset-0 opacity-50">
		<LoginRightPaneGraphics></LoginRightPaneGraphics>
	</div>
	<div
		class="-desktop:flex -desktop:justify-center -desktop:bg-gradient-to-b from-[#171514] to-[#1715147F] desktop:place-items-center -desktop:items-center"
	>
		<div class="z-20 max-w-[386px] w-full -desktop:px-5">
			<slot></slot>
		</div>
	</div>
</div>

<LogoContainer></LogoContainer>
