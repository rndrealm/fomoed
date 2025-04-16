<script lang="ts">
	import { failure, success } from '$lib/utils';
	import { goto } from '$app/navigation';
	import UpdatePasswordForm from '$lib/comps/forms/UpdatePasswordForm.svelte';
	import TwoPaneLayout from '../TwoPaneLayout.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	export let data: { session: any; supabase: SupabaseClient; user: any };

	async function onSubmit(event) {
		event.preventDefault();

		const form = event.target;
		const formData = new FormData(form);
		const data_ = Object.fromEntries(formData.entries());

		console.log('data_', data_);

		if (data_.password !== data_['confirm-password']) {
			failure('Passwords do not match');
			return;
		}

		const { error } = await data.supabase.auth.updateUser(
			{ password: data_.password }
			// $page.url.searchParams.get('token_hash')
		);

		if (error) {
			failure(error.message);
			return;
		} else {
			success('Successfully updated password!');
			goto('/');
		}
	}
</script>

<TwoPaneLayout>
	<form method="POST" on:submit={onSubmit}>
		<UpdatePasswordForm />
	</form>
</TwoPaneLayout>
