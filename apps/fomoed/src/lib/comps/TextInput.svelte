<script lang="ts">
	import HidePassword from '$lib/icons/HidePassword.svelte';
	import ShowPassword from '$lib/icons/ShowPassword.svelte';
	import { writable } from 'svelte/store';

	export let id = '';
	export let hidden = false;
	export let placeholder = '';

	export let value = '';

	const visibleIfPassword = writable(false);

	let input: HTMLInputElement;

	visibleIfPassword.subscribe((v) => {
		if (!input) {
			return;
		}

		if (v) {
			input.type = 'text';
		} else {
			input.type = 'password';
		}
	});

	// Set visible to false when the user deletes the visible password
	$: if (!value) {
		visibleIfPassword.set(false);
	}
</script>

{#if hidden}
	<div class="relative">
		<input
			type="password"
			class="tracking-widest"
			{id}
			name={id}
			placeholder="••••••••"
			bind:value
			bind:this={input}
		/>

		<button
			class="absolute inset-y-0 right-[14px] disabled:opacity-50 duration-200"
			on:click={() => visibleIfPassword.set(!$visibleIfPassword)}
			type="button"
			disabled={!value}
		>
			{#if !$visibleIfPassword}
				<ShowPassword />
			{:else}
				<HidePassword />
			{/if}
		</button>
	</div>
{:else}
	<input {id} name={id} {placeholder} bind:value />
{/if}

<style>
	input {
		@apply placeholder-[#FFFFFF66] border-white border-opacity-15 hover:border-opacity-30 focus:bg-[#FFFFFF1A] border rounded-[14px] bg-transparent h-[54px] px-4 w-full outline-none;
	}
</style>
