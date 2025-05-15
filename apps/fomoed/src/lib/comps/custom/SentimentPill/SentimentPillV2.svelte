<script lang="ts">
	import { getSentimentTextColor } from '$ts/client/utils/ui';
	import { capitalize } from 'lodash-es';

	type Props = {
		sentiment: 'bullish' | 'bearish' | 'neutral';
		class?: string;
	};

	let { sentiment, class: customClass = '' }: Props = $props();
</script>

<div
	class:hidden={sentiment === 'neutral'}
	class="px-0 flex justify-center text-[13px] font-medium py-1 w-[61px] text-xs border border-[#1E1E1E] rounded-[8px] {sentiment ===
	'bullish'
		? 'bg-transparent'
		: sentiment === 'bearish'
			? 'bg-transparent'
			: 'bg-transparent'} {customClass}"
	style="color: {getSentimentTextColor(sentiment)};"
>
	{capitalize(sentiment)}
</div>
