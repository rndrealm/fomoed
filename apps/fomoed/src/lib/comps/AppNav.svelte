<script lang="ts">
	import { auth_user } from '$lib/stores/user';
	import AllNewsButton from './AllNewsButton.svelte';
	import DashboardButton from './buttons/DashboardButton.svelte';
	import LoginButton from './buttons/LoginButton.svelte';
	import CryptoDropdown from './CryptoDropdown.svelte';
	import LoadUserData from './func/LoadUserData.svelte';
	import MobileMenuButton from './mobile/MobileMenuButton.svelte';
	import ProfileButton from './ProfileButton.svelte';

	interface Props {
		showCurrencyDropdown?: boolean;
		showsAllNewsLinkOnDesktop?: boolean;
		showDashboardLink?: boolean;
		title?: Snippet;
		class?: string;
	}
	import type { Snippet } from 'svelte';

	let {
		showCurrencyDropdown = false,
		showsAllNewsLinkOnDesktop: showAllNewsLink = false,
		showDashboardLink = false,
		title,
		class: cls = ''
	}: Props = $props();
</script>

<LoadUserData />

<nav class="relative w-full z-10 flex-shrink-0 px-4 {cls} pt-3">
	<div class="flex items-center max-w-[1050px] w-full mx-auto">
		<div class="top-0 z-10 flex items-center flex-grow h-full gap-x-4">
			<a href="https://fomoed.io" class="flex items-center flex-shrink-0 h-10">
				<img src="/fomoed2.svg" alt="Fomoed." class="h-full" />
			</a>

			{@render title?.()}
		</div>

		<div class="flex gap-x-[10px] items-center h-full">
			<div class="flex-grow"></div>

			{#if showDashboardLink}
				<DashboardButton />
			{/if}

			{#if showAllNewsLink}
				<div class="-desktop:hidden">
					<AllNewsButton />
				</div>
			{/if}

			{#if showCurrencyDropdown}
				<CryptoDropdown />
			{/if}

			{#if $auth_user}
				<div class="-desktop:hidden">
					<ProfileButton></ProfileButton>
				</div>
			{:else}
				<div class="-desktop:hidden">
					<LoginButton></LoginButton>
				</div>
			{/if}

			<div class="desktop:hidden h-[50px]">
				<MobileMenuButton></MobileMenuButton>
			</div>
		</div>
	</div>
</nav>
