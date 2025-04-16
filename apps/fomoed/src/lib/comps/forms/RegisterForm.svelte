<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import MainButton from '../buttons/MainButton.svelte';
	import TextInput from '../TextInput.svelte';
	import InputLabel from '../InputLabel.svelte';
	import TextButton from '../TextButton.svelte';

	const dispatch = createEventDispatcher();

	let username = '';
	let email = '';
	let password = '';
</script>

<div>
	<h1 class="font-paralucent-demibold text-[32px]">Create an account</h1>
	<div class="text-[#FFFFFFCC] pt-[12px] -desktop:text-sm">
		Join the club and start you 30 day free trial.
	</div>

	<div class="pt-5">
		<InputLabel forId="username">Username</InputLabel>
		<div class="mt-2">
			<TextInput bind:value={username} id="username" placeholder="fomoed00" />
		</div>

		<InputLabel forId="email">Email</InputLabel>
		<div class="mt-2">
			<TextInput bind:value={email} id="email" placeholder="example@mail.com" />
		</div>

		<InputLabel forId="password">Password</InputLabel>
		<div class="mt-2">
			<TextInput bind:value={password} id="password" hidden />
		</div>
	</div>

	<div class="pt-[30px] -desktop:pt-5">
		<MainButton disabled={!username || !email || !password}>Register now</MainButton>
	</div>

	<div class="pt-3 -desktop:text-center -desktop:text-xs -desktop:pt-5">
		<span class="opacity-40">Already have an account? </span>
		<TextButton on:click={() => dispatch('click-login-link')}>Login</TextButton>
	</div>
</div>
