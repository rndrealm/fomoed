<script lang="ts">
	import CaretDown from '$lib/icons/CaretDown.svelte';

	export let data: {
		market_cap: {
			value: string;
			change: number; // Positive or negative
		};
		volume_24h: {
			value: string;
			change: number; // Positive or negative
		};
		btc_dominance: {
			value: string;
			change: number; // Positive or negative
		};
	};

	const data_names: (keyof typeof data)[] = ['market_cap', 'volume_24h', 'btc_dominance'];
</script>

{#if data}
	<div
		class="info_items w-full flex flex-col lg:flex-row items-center justify-between space-y-10 lg:space-y-0 lg:space-x-10 px-5"
	>
		{#each data_names as field_name}
			{#if data[field_name]}
				<div
					class="info_item rounded {data[field_name].change < 0
						? 'bg-[#ff4d4d1a]'
						: 'bg-[#6ccf591a]'}
                        p-4
                        flex flex-col items-start justify-center w-full
                        text-xs"
				>
					<div class="field_title uppercase font-extrabold">
						{field_name.split('_').join(' ')}
					</div>
					<div class="data_fields flex items-center justify-between w-full pt-5 text-sm">
						<div class="data">
							{data[field_name].value.toLocaleString()}
						</div>
						<div
							class="change rounded {data[field_name].change < 0
								? 'bg-[#f029341a] text-[#ff4d4d]'
								: 'bg-[#35b34950] text-[#6ccf59]'} pl-1 pr-3 py-1 flex items-center justify-center"
						>
							<CaretDown
								class={data[field_name].change < 0 ? '' : 'rotate-180'}
								fill={data[field_name].change < 0 ? '#ff4e4d' : '#6ccd59'}
							/>
							{Math.abs(data[field_name].change)}%
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
{/if}
