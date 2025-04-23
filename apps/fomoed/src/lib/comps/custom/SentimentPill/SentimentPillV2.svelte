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
	class="px-6 text-[13px] font-medium py-0.5 text-xs rounded-full {sentiment === 'bullish'
		? 'bg-transparent'
		: sentiment === 'bearish'
			? 'bg-transparent'
			: 'bg-transparent'} {customClass}"
	style="color: {getSentimentTextColor(sentiment)};"
>
	{capitalize(sentiment)}
</span>
