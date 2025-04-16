<script lang="ts">
	import { writable } from 'svelte/store';
	import type { ActionData } from './$types';
	import { failure } from '$lib/utils';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth_user } from '$lib/stores/user';
	import LoginForm from '$lib/comps/forms/LoginForm.svelte';
	import RegisterForm from '$lib/comps/forms/RegisterForm.svelte';
	import ForgotPasswordForm from '$lib/comps/forms/ForgotPasswordForm.svelte';
	import TwoPaneLayout from './TwoPaneLayout.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	export let supabase: SupabaseClient;

	const action = writable<'login' | 'signup' | 'forgot' | 'update_password'>('login');

	onMount(() => {
		if ($page.url.searchParams.get('token_hash')) {
			action.set('update_password');
		}
	});

	export let form: ActionData;

	$: form && console.log('Auth Response: ', form);

	// TODO Change from toast notifications as they are not working as expected
	$: if (form) {
		if (form.error) {
			failure(form.error);
		}
	}

	auth_user.subscribe((u) => {
		if ($page.url.searchParams.get('token_hash')) {
			action.set('update_password');
		}
	});
</script>

<TwoPaneLayout>
	<form method="POST" action="?/{$action}">
		{#if $action === 'signup'}
			<RegisterForm on:click-login-link={() => action.set('login')} />
		{/if}

		{#if $action === 'forgot'}
			<ForgotPasswordForm on:click-login-link={() => action.set('login')} />
		{/if}

		{#if $action === 'login'}
			<LoginForm
				on:click-forgot-password={() => action.set('forgot')}
				on:click-register-link={() => action.set('signup')}
			/>
		{/if}
	</form>
</TwoPaneLayout>
