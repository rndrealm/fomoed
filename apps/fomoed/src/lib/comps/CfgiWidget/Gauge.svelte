<script lang="ts">
	import { fade } from 'svelte/transition';

	interface GaugeProps {
		value: number;
		label?: string;
	}

	let { value, label = 'Greed' }: GaugeProps = $props<{ value: number | null; label: string }>();

	// Where gold stops and red begins (in percentage terms)
	const goldBoundary = 80;

	// SVG dimensions and gauge geometry
	const width = 300;
	const height = 220;
	const cx = width / 2; // center x
	const cy = width / 2; // center y (same for a square viewBox)
	const r = 115; // radius of the gauge arc

	/**
	 * Convert "gauge angle" (0 = far left, 180 = far right) into
	 * standard Cartesian coordinates. We offset by +180 degrees so
	 * that 0 degrees lands on the left side.
	 */
	function polarToCartesian(
		cx: number,
		cy: number,
		r: number,
		angleInDegrees: number
	): { x: number; y: number } {
		const angleInRadians = ((angleInDegrees + 180) * Math.PI) / 180;
		return {
			x: cx + r * Math.cos(angleInRadians),
			y: cy + r * Math.sin(angleInRadians)
		};
	}

	/**
	 * Describe an arc path in SVG from startAngle to endAngle
	 * (angles in [0..180] for a half-circle gauge).
	 */
	function describeArc(
		cx: number,
		cy: number,
		r: number,
		startAngle: number,
		endAngle: number
	): string {
		const start = polarToCartesian(cx, cy, r, endAngle);
		const end = polarToCartesian(cx, cy, r, startAngle);
		// If the arc is <= 180 degrees, largeArcFlag=0, else 1
		const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

		return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
	}

	// Calculate boundary angle (where gold stops and red begins)
	const boundaryAngle = (goldBoundary / 100) * 180; // 0..180

	// Arc paths for gold (0..boundaryAngle) and red (boundaryAngle..180)
	let goldArc = $derived(describeArc(cx, cy, r, 0, boundaryAngle));
	let redArc = $derived(describeArc(cx, cy, r, boundaryAngle, 180));

	// Needle angle: 0..180
	let needleAngle = $derived((value / 100) * 180);

	// End of the needle line (somewhat shorter than the arc radius)
	let needleEnd = $derived(polarToCartesian(cx, cy, r * 1.2, needleAngle));

	let labelColor = $derived.by(() => {
		if (value < 80) return '#C3A002';
		return '#D10101';
	});
</script>

<div class="w-full h-full relative">
	<svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
		<!-- Gradient definitions -->
		<defs>
			<!-- Gold gradient -->
			<linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#C39F07" />
				<stop offset="100%" stop-color="#C3A000" />
			</linearGradient>

			<!-- Red gradient -->
			<linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="#FF0303" />
				<stop offset="100%" stop-color="#9B0000" />
			</linearGradient>
		</defs>

		<!-- Gold arc (0% to goldBoundary%) -->
		<path d={goldArc} fill="none" stroke="url(#goldGradient)" stroke-width="45" />

		<!-- Red arc (goldBoundary% to 100%) -->
		<path d={redArc} fill="none" stroke="url(#redGradient)" stroke-width="45" />

		<!-- The needle -->
		{#if value !== null}
			<line
				transition:fade
				x1={cx}
				y1={cy}
				x2={needleEnd.x}
				y2={needleEnd.y}
				stroke="#fff"
				stroke-width="6"
				stroke-linecap="round"
			/>
		{/if}

		<!-- A small center circle for aesthetics -->
		<circle {cx} {cy} r="45" fill="#000" stroke="#2B2B2B" stroke-width="6" />

		<!-- Value text -->
		{#if value !== null}
			<text in:fade x={cx} y={cy - 2} class="center-text font-inter font-bold text-3xl" fill="white"
				>{value}</text
			>
		{:else}
			<rect
				x={cx - 20}
				y={cy - 20}
				width="40"
				height="24"
				rx="3"
				fill="#2B2B2B"
				class="animate-pulse"
			/>
		{/if}

		<!-- Label text -->
		<text
			x={cx}
			y={cy + 18}
			class="center-text sub-text font-inter font-semibold"
			fill={labelColor}
		>
			{label}
		</text>
	</svg>

	<div class="absolute bottom-0 pb-2 flex inset-x-0 px-2">
		<div class="label">
			Extreme <br /> Fear
		</div>

		<div class="flex-grow"></div>

		<div class="label">
			Extreme <br /> Greed
		</div>
	</div>
</div>

<style>
	.label {
		@apply border-[#929292] border-2 font-inter font-bold rounded-md text-[#929292] px-2 py-1 text-center text-xs bg-[#110F0E];
	}

	svg {
		width: 100%;
		height: 100%;
	}

	.center-text {
		text-anchor: middle;
		dominant-baseline: middle;
	}

	.sub-text {
		font-size: 1rem;
	}
</style>
