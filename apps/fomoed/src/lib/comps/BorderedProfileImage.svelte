<script>
	import ProfileIcon from '$lib/icons/ProfileIcon.svelte';
	import { auth_user } from '$lib/stores/user';
	import { userService } from '$ts/client/services/UserService.svelte';

	$: premium = $auth_user?.has_valid_sub;

	let imgSrc = `${userService.authUser?.user_metadata.avatar_url}`;
	function handleError() {
		imgSrc = `https://ui-avatars.com/api/?background=random&name=${userService.authUser?.user_metadata.name || $auth_user?.username}`;
	}
</script>

<div
	id="profile-img-container"
	class:premium
	class="bg-[#221F1D] aspect-square grid place-items-center rounded-[50%] overflow-hidden border border-transparent relative"
>
	{#if userService.authUser}
		<img
			src={imgSrc}
			alt=""
			class="object-cover w-full rounded-full aspect-square"
			onerror={handleError}
		/>
	{:else}
		<ProfileIcon />
	{/if}
</div>

<style>
	#profile-img-container {
		@apply relative;
	}

	#profile-img-container.premium {
		background:
			linear-gradient(#201e1e, #201e1e) padding-box,
			linear-gradient(90deg, #ff3b10 0%, #f3c111 71.5%) border-box;
	}

	#profile-img-container.premium::after {
		@apply absolute left-0 bottom-0 rounded-tr-[50%] bg-no-repeat bg-center bg-cover;
		@apply w-[26%] h-[26%] aspect-square;
		content: '';
		background: linear-gradient(90deg, #ff3b10 0%, #f3c111 71.5%);
	}
</style>
