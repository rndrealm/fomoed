<script lang="ts">
	import LogoContainer from '$lib/comps/LogoContainer.svelte';
</script>

<div
	class="bg-no-repeat desktop:bg-cover -desktop:bg-[60%_40%] absolute inset-0 grid place-items-center bg-[url(/background/auth-single-pane.svg)] -desktop:bg-[url(/background/mobile/email-sent.svg)]"
>
	<div class="max-w-[400px]">
		<slot></slot>
	</div>
</div>

<LogoContainer></LogoContainer>
