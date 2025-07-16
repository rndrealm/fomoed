<script lang="ts">
	import { PUBLIC_DASHBOARD_URL } from '$env/static/public';
	import MainButton from '$lib/comps/buttons/MainButton.svelte';
	import { mobileMenuOpen } from '$lib/stores/ui';
</script>

<div class="w-[138px] -desktop:w-[110px] {$$props.class}">
	<a href={PUBLIC_DASHBOARD_URL + '/auth/login'} on:click={() => mobileMenuOpen.set(false)}>
		<MainButton>
			<span class="uppercase">Login</span>
			<img src="/icons/login-arrow.svg" width={17} height={13} alt="Arrow right" />
		</MainButton>
	</a>
</div>
