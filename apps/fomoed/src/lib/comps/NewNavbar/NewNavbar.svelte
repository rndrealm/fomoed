<script>
	import ProfileButton from './ProfileButton.svelte';
	import DashboardButton from './DashboardButton.svelte';
	import NewNavbarLogo from '../NewNavbarLogo/NewNavbarLogo.svelte';

	// You can add props here if needed, for example:
	// let { activePage } = $props();
</script>

<nav class="shadow-md px-4 -desktop:px-0 bg-[#131313] h-[80px] flex items-center">
	<div class="px-4 lg:px-12 mx-auto flex justify-between items-center w-full">
		<!-- Logo section -->
		<div class="flex items-center">
			<a href="/" class="">
				<NewNavbarLogo />
			</a>
		</div>

		<!-- Navigation buttons -->
		<div class="flex items-center space-x-4">
			<DashboardButton></DashboardButton>
			<ProfileButton></ProfileButton>
		</div>
	</div>
</nav>

<style>
	nav {
		border-bottom: 0.5px solid;
		border-image-source: linear-gradient(
			90deg,
			rgba(255, 59, 16, 0.75) 0%,
			rgba(243, 193, 17, 0.75) 100%
		);
		border-image-slice: 1;
	}
</style>
