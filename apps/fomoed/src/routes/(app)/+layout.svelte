<script lang="ts">
	import 'simplebar';
	import 'simplebar/dist/simplebar.css';
	import '$lib/app.css';

	import ResizeObserver from 'resize-observer-polyfill';
	import { browser } from '$app/environment';
	import { goto, invalidate } from '$app/navigation';
	import { onMount, setContext } from 'svelte';

	import { page } from '$app/stores';
	import { no_reroute_routes } from '$lib';
	import { auth_email, logged_in } from '$lib/stores/user';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { failure, fetch_global_data } from '$lib/utils/index.js';
	import { MetaTags } from 'svelte-meta-tags';
	import { refresh_coinstats_coin_list } from '$lib/utils';
	import MobileMenu from '$lib/comps/mobile/MobileMenu.svelte';
	import { displayLogoutPopup, innerWidth, innerHeight, mobileMenuOpen } from '$lib/stores/ui.js';
	import SignOutPopup from '$lib/comps/popups/SignOutPopup.svelte';
	import { signOut } from '$lib/utils/user.js';
	import { supabaseStore } from '$ts/client/utils/supabase.svelte';
	import { Toaster } from 'svelte-5-french-toast';

	// const supabase = getContext<SupabaseClient>('supabase');

	// Redirected here once the user has bought and they will add the sessionId as a query parameter

	export let data;
	$: ({ session, supabase, user } = data);

	onMount(() => {
		refresh_coinstats_coin_list();
		fetch_global_data();

		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (!newSession) {
				/**
				 * Queue this as a task so the navigation won't prevent the
				 * triggering function from completing
				 */
				auth_email.set(null);
				logged_in.set(false);

				if ($page.route.id && !no_reroute_routes.includes($page.route.id)) {
					setTimeout(() => {
						goto('/auth', { invalidateAll: true });
					});
				}
			} else {
				if (newSession?.expires_at && Date.now() / 1000 < newSession?.expires_at) {
					// Refresh the user data/information
					if (browser && user?.email) {
						auth_email.set(user?.email);
						logged_in.set(true);
					}
				}
			}

			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}

			// if (event === 'PASSWORD_RECOVERY') {
			// 	goto('/auth?uid=' + newSession?.user?.id);
			// }
		});

		const error_msg = $page.url.hash
			.split('&')
			.filter((m) => m.startsWith('error_description'))[0]
			?.split('=')[1]
			?.replaceAll('+', ' ');

		if (error_msg) {
			failure(error_msg);
		}

		return () => data.subscription.unsubscribe();
	});

	if (browser) {
		window.ResizeObserver = ResizeObserver;
	}

	$: ((supabase) => browser && setContext('supabase', supabase))(supabase);

	$: supabaseStore.set(supabase);

	$: console.log('display logout popup:', $displayLogoutPopup);
</script>

<MetaTags
	title="Fomoed"
	description="Fomoed provides a toolset for effortlessly navigating the emotional rollercoaster that is
crypto. Have complete access to your favorite Altcoins and get precise data-based market
sentiment analysis"
	openGraph={{
		title: `Fomoed`,
		url: $page.url.href,
		images: [
			{
				url: 'https://firebasestorage.googleapis.com/v0/b/deji-firegram.appspot.com/o/fomoed2.png?alt=media&token=f5c6eca0-0aad-4930-8200-5c87a26218a6',
				width: 205,
				height: 50,
				alt: `Fomoed`
			}
		],
		siteName: 'Fomoed',
		description:
			'Fomoed provides a toolset for effortlessly navigating the emotional rollercoaster that is crypto. Have complete access to your favorite Altcoins and get precise data-based market sentiment analysis'
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: `Fomoed`,
		description:
			'Fomoed provides a toolset for effortlessly navigating the emotional rollercoaster that is crypto. Have complete access to your favorite Altcoins and get precise data-based market sentiment analysis',
		image:
			'https://firebasestorage.googleapis.com/v0/b/deji-firegram.appspot.com/o/fomoed2.png?alt=media&token=f5c6eca0-0aad-4930-8200-5c87a26218a6',
		imageAlt: `Fomoed`
	}}
/>

<!-- <main>
	<SvelteToast />
	<Nav />

	<slot />
</main> -->

<svelte:window bind:innerWidth={$innerWidth} bind:innerHeight={$innerHeight} />

{#if $mobileMenuOpen && !$displayLogoutPopup}
	<MobileMenu />
{/if}

<SvelteToast />
<Toaster />

<slot />

{#if $displayLogoutPopup}
	<SignOutPopup
		on:sign-out={async () => {
			await signOut(supabase);
			goto('/auth');
		}}
		on:cancel={() => displayLogoutPopup.set(false)}
	/>
{/if}
