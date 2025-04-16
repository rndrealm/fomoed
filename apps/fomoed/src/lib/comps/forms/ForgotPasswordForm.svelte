<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import MainButton from '$lib/comps/buttons/MainButton.svelte';

	import TextInput from '$lib/comps/TextInput.svelte';
	import InputLabel from '$lib/comps/InputLabel.svelte';
	import TextButton from '$lib/comps/TextButton.svelte';

	const dispatch = createEventDispatcher();

	let email = '';
</script>

<div>
	<h1 class="font-paralucent-demibold text-[32px]">Reset Password</h1>
	<div class="text-[#FFFFFFCC] pt-3 -desktop:text-sm">
		Enter your email and please wait to get the link for password reset
	</div>

	<div class="pt-5">
		<InputLabel forId="email">Email</InputLabel>

		<div class="mt-2">
			<TextInput id="email" placeholder="example@mail.com" bind:value={email} />
		</div>
	</div>

	<div class="pt-[30px] -desktop:pt-5">
		<MainButton disabled={!email}>Get the link</MainButton>
	</div>

	<div class="pt-3 -desktop:pt-5 text-center -desktop:text-xs">
		<TextButton on:click={() => dispatch('click-login-link')}>Return to login</TextButton>
	</div>
</div>
