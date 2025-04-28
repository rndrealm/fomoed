<script lang="ts">
	import { fade } from 'svelte/transition';
	import MainButton from '../buttons/MainButton.svelte';
	import PaidPlanBadge from '../decorations/PaidPlanBadge.svelte';
	import type { PlanId } from '$ts/types';
	import { capitalize } from 'lodash-es';
	import { ArrowRight, ChevronRight } from 'lucide-svelte';

	let props: { planId: PlanId } = $props();
</script>

<div
	in:fade={{ duration: 100 }}
	class="bg-[#0F0F0F99] backdrop-blur-sm absolute inset-0 z-20 rounded-[28px] grid place-items-center"
>
	<div class="px-4">
		<div class="text-[15px] font-semibold font-inter text-center">
			Get the next level plan to unlock more!
		</div>

		<div class="flex justify-center mt-3 space-x-3">
			<img src="/premium-logo.png" alt="Fomoed." class="w-[158px] -desktop:w-[125px]" />
			<!-- <PaidPlanBadge planName={capitalize(props.planId)}></PaidPlanBadge> -->
		</div>

		<div class="mt-8">
			<a href="/plans" class="flex justify-center">
				<button
					class="flex items-center gap-[18px] justify-center border border-[#323232] rounded-[10px] px-4 py-[10px]"
				>
					<span class="text-xs font-semibold">Select Your Plan</span>
					<ArrowRight class="w-4 h-4" />
					<!-- <img src="/icons/login-arrow.svg" width={17} height={13} alt="Arrow right" /> -->
				</button>
			</a>
		</div>
	</div>
</div>
