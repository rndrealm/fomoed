<script lang="ts">
	import { enableXmas } from '$ts/utils/client/ui';

	const coins = ['btc', 'ether', 'tether', 'bnc', 'map'];

	function startExmasEffetcs() {
		const targets = new Array(...document.querySelectorAll('.__coin-decor'));

		function updateDecorOpacity() {
			const screenW = document.body.clientWidth;
			const screenCenterX = screenW / 2;

			for (const target of targets) {
				const { x, width } = target.getBoundingClientRect();
				const center = x + width / 2;

				const relOffset = Math.abs(center - screenCenterX) / (screenW / 10);
				const opacity = Math.max(0, 1 - relOffset) * 0.3;

				target.style.opacity = opacity;
			}
		}

		setInterval(updateDecorOpacity, 1000 / 60);
	}

	$effect(() => {
		if (enableXmas) {
			startExmasEffetcs();
		}
	});
</script>

<div class="relative h-[500px] -sm:h-[250px] flex items-center">
	<!-- Glow -->
	<div class="absolute w-screen grid place-items-center h-full">
		<div class="w-full h-full overflow-hidden -z-10">
			<div
				class="h-full transitionColor"
				style="background: radial-gradient(#0009, black 75%);"
			></div>
		</div>
	</div>

	<!-- Coins -->
	<div class="h-full flex items-center">
		<div class="overflow-hidden max-w-[100vw] relative h-full items-center flex">
			<div class="movingContent">
				{#each [...coins, ...coins] as coin}
					<div style="background-image: url(/images/carousel/{coin}.svg); background-size: 94%;">
						{#if enableXmas}
							<div
								class="__coin-decor absolute inset-0 bg-center bg-[url(/images/xmas/coin-frost.svg)] bg-no-repeat opacity-0"
								style="background-size: 80%;"
							></div>
						{/if}
					</div>
				{/each}
			</div>

			<div
				class="h-full bg-gradient-to-r from-black to-transparent w-[50%] absolute -left-1 top-0 z-10"
			></div>

			<div
				class="h-full bg-gradient-to-l from-black to-transparent w-[50%] absolute -right-1 top-0 z-10"
			></div>
		</div>
	</div>
</div>

<style>
	.movingContent {
		@apply flex max-w-full;
		display: flex;
		animation: moveLinear 15s linear infinite;
	}

	.movingContent > div {
		@apply -sm:w-[33.33vw] w-[20vw] h-[40vw] flex-shrink-0 inline-block bg-center relative;
	}

	@media (max-width: 639px) {
		.transitionColor {
			animation: transitionColor 18s linear infinite;
		}

		@keyframes moveLinear {
			0% {
				transform: translateX(0);
			}
			100% {
				transform: translateX(-166%);
			}
		}
	}

	@media (min-width: 640px) {
		.transitionColor {
			animation: transitionColor 15s linear infinite;
		}

		@keyframes moveLinear {
			0% {
				transform: translateX(0);
			}
			100% {
				transform: translateX(-100%);
			}
		}
	}

	@keyframes transitionColor {
		0% {
			background-color: #27a17b;
		}

		20% {
			background-color: #f0b90b;
		}

		40% {
			background-color: #c44fe2;
		}

		60% {
			background-color: #f9aa4b;
		}

		80% {
			background-color: #627eea;
		}
	}
</style>
