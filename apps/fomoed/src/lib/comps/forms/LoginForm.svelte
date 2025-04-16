<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import MainButton from '$lib/comps/buttons/MainButton.svelte';
	import GoogleSignInButton from '$lib/comps/GoogleSignInButton.svelte';
	import TextInput from '$lib/comps/TextInput.svelte';
	import InputLabel from '../InputLabel.svelte';
	import TextButton from '../TextButton.svelte';

	const dispatch = createEventDispatcher();

	let email = '';
	let password = '';
</script>

<div>
	<h1 class="font-paralucent-demibold text-[32px]">Welcome!</h1>
	<div class="text-[#FFFFFFCC] -desktop:text-sm">
		Log in to fomoed to continue access more tools.
	</div>

	<div class="pt-[30px]">
		<GoogleSignInButton />
	</div>

	<div class="pt-5 flex items-center">
		<div class="h-px bg-[#FFFFFF33] mr-8 flex-grow"></div>
		<div class="font-paralucent font-medium opacity-80">or</div>
		<div class="h-px bg-[#FFFFFF33] ml-8 flex-grow"></div>
	</div>

	<div class="pt-5">
		<InputLabel forId="email">Email</InputLabel>
		<div class="mt-3">
			<TextInput bind:value={email} id="email" placeholder="example@mail.com" />
		</div>

		<div class="flex mt-3 items-center">
			<InputLabel forId="password">Password</InputLabel>
			<button
				on:click={() => dispatch('click-forgot-password')}
				class="text-[#FFFFFF99] text-xs font-satoshi font-medium hover:underline active:brightness-50"
			>
				Forgot your password?
			</button>
		</div>
		<TextInput bind:value={password} id="password" hidden />
	</div>

	<div class="pt-[30px] -desktop:pt-[20px]">
		<MainButton disabled={!email || !password}>Sign In</MainButton>
	</div>

	<div class="pt-3 -desktop:text-center -desktop:text-xs">
		<span class="opacity-40">Don't have an account? </span>
		<TextButton on:click={() => dispatch('click-register-link')}>Register now!</TextButton>
	</div>
</div>
