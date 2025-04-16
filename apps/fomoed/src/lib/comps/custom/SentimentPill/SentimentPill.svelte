<script lang="ts">
	import { getSentimentTextColor } from '$ts/client/utils/ui';
	import { capitalize } from 'lodash-es';

	type Props = {
		sentiment: 'bullish' | 'bearish' | 'neutral';
		class?: string;
	};

	let { sentiment, class: customClass = '' }: Props = $props();
</script>

<span
	class:hidden={sentiment === 'neutral'}
	class="px-4 py-0.5 text-xs rounded-full {sentiment === 'bullish'
		? 'bg-[#1F2D24]'
		: sentiment === 'bearish'
			? 'bg-[#240D0F]'
			: 'bg-gray-500'} {customClass}"
	style="color: {getSentimentTextColor(sentiment)};"
>
	{capitalize(sentiment)}
</span>
