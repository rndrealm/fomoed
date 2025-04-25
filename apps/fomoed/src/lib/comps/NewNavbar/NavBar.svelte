<script>
	import { page } from '$app/stores';
	import ProfileButton from './ProfileButton.svelte';
	import DashboardButton from './DashboardButton.svelte';
	import NewNavbarLogo from '../NewNavbarLogo/NewNavbarLogo.svelte';
	// import { toast as tost } from '@zerodevx/svelte-toast';
	import toast from 'svelte-5-french-toast';

	function handleComingSoon() {
		toast('Coming Soon', {
			icon: '⏳'
		});
	}

	// You can add props here if needed, for example:
	// let { activePage } = $props();

	$: currentPath = $page.url.pathname;
	let scrollY = 0;
</script>

<div class="fixed top-0 w-full z-[999] -desktop:bg-[50%_50%]">
	<div class="relative overflow-hidden p-[1px] max-w-[550px] mx-auto w-full mt-3 rounded-2xl">
		<div class="gradient_border_tab"></div>

		<nav class="mx-auto px-6 py-[14px] bg-[#000] relative rounded-2xl">
			<div class="flex items-center justify-between w-full">
				<div class="flex items-center gap-6">
					<a href="/dashboard">
						<img src="/icons/small-logo.svg" alt="" />
					</a>

					<div class="flex items-center gap-4">
						<a href="/dashboard">
							<p
								class={`text-base font-semibold leading-[135%] ${currentPath === '/dashboard' ? 'text-white' : 'text-[#9b9b9b]'}`}
							>
								Dashboard
							</p>
						</a>

						<a href="/news">
							<p
								class={`text-base font-semibold leading-[135%] ${currentPath === '/news' ? 'text-white' : 'text-[#9b9b9b]'}`}
							>
								News
							</p>
						</a>

						<button type="button" on:click={handleComingSoon}>
							<p class="text-[#9b9b9b] text-base font-semibold leading-[135%] cursor-pointer">
								Signals
							</p>
						</button>
					</div>
				</div>

				<div class="">
					<ProfileButton></ProfileButton>
				</div>
			</div>
		</nav>
	</div>
</div>

<style>
	.gradient_border_tab {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		border-radius: inherit;
		/* background: conic-gradient(from 0deg at 50% 50%, #000000 0%, #666666 50%, #000000 100%); */
		/* background: conic-gradient(
      from 0deg at 50% 50%,
      #020100 0%,
      #342828 17%,
      #8b4332 35%,
      #8b2505 55%,
      #bd4618 72%,
      #f7984b 84%,
      #f7984b 100%
    ); */
		background: conic-gradient(
			from 0deg at 50% 50%,
			#020100 0%,
			#342828 17%,
			#8b4332 35%,
			#8b2505 55%,
			#bd4618 72%,
			#f7984b 84%,
			#f7984b 100%
		);
		background: linear-gradient(
			to bottom,
			#020100 0%,
			#342828 1%,
			#8b4332 35%,
			#8b2505 55%,
			#bd4618 72%,
			#f7984b 84%,
			#f7984b 100%
		);
		/* inset: -10000%; */
		pointer-events: none;
		opacity: 0.4;
	}
</style>
