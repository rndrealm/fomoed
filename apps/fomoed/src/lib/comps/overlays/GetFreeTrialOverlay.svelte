<script lang="ts">
	import { fade } from 'svelte/transition';
	import MainButton from '../buttons/MainButton.svelte';
	import PaidPlanBadge from '../decorations/PaidPlanBadge.svelte';

	const { hideCb }: { hideCb: () => void } = $props();
</script>

<div
	in:fade={{ duration: 100 }}
	class="bg-[#0F0F0F99] backdrop-blur-sm absolute inset-0 z-10 rounded-[28px] grid place-items-center"
>
	<div>
		<div class="text-[24px] font-paralucent-demibold text-center">
			Get your free trial to unlock more!
		</div>

		<div class="flex justify-center mt-2 space-x-3">
			<img src="/fomoed.svg" alt="Fomoed." class="w-[158px] -desktop:w-[125px]" />
			<PaidPlanBadge></PaidPlanBadge>
		</div>

		<div class="mx-4 mt-6">
			<a href="/plans">
				<MainButton>
					<span class="uppercase">Start Free Trial</span>
					<img src="/icons/login-arrow.svg" width={17} height={13} alt="Arrow right" />
				</MainButton>
			</a>

			<button onclick={hideCb} class="block mx-auto mt-4 text-sm underline hover:text-primary">
				Later
			</button>
		</div>
	</div>
</div>
