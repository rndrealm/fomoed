<script lang="ts">
	import { fade } from 'svelte/transition';
	import MainButton from '../buttons/MainButton.svelte';
	import PaidPlanBadge from '../decorations/PaidPlanBadge.svelte';
	import type { PlanId } from '$ts/types';
	import { capitalize } from 'lodash-es';

	let props: { planId: PlanId } = $props();
</script>

<div
	in:fade={{ duration: 100 }}
	class="bg-[#0F0F0F99] backdrop-blur-sm absolute inset-0 z-20 rounded-[28px] grid place-items-center"
>
	<div class="px-4">
		<div class="text-[24px] font-paralucent-demibold text-center">
			Get the next level plan to unlock more!
		</div>

		<div class="mt-2 flex justify-center space-x-3">
			<img src="/fomoed.svg" alt="Fomoed." class="w-[158px] -desktop:w-[125px]" />
			<PaidPlanBadge planName={capitalize(props.planId)}></PaidPlanBadge>
		</div>

		<div class="mt-6 mx-4">
			<a href="/plans">
				<MainButton>
					<span class="uppercase">Select Your Plan</span>
					<img src="/icons/login-arrow.svg" width={17} height={13} alt="Arrow right" />
				</MainButton>
			</a>
		</div>
	</div>
</div>
