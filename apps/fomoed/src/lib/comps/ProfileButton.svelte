<script>
	import ProfileIcon from '$lib/icons/ProfileIcon.svelte';
	import { displayLogoutPopup } from '$lib/stores/ui';
	import { auth_email, auth_user } from '$lib/stores/user';
	import { userService } from '$ts/client/services/UserService.svelte';
	import ProfileDropdown from './ProfileDropdown.svelte';

	let expanded = false;

	$: premium = $auth_user?.has_valid_sub;

	const premiumBorderCollapsed =
		'background: linear-gradient( #13100F, #13100F) padding-box, linear-gradient(90deg, #FF3B10 0%, #F3C111 71.5%) border-box';

	const premiumBorderExpanded =
		'background: linear-gradient( #201E1E, #201E1E) padding-box, linear-gradient(90deg, #FF3B10 0%, #F3C111 71.5%) border-box';

	let open = false;
</script>

<button
	style={premium ? (expanded ? premiumBorderExpanded : premiumBorderCollapsed) : ''}
	class:bg-opacity-80={!premium}
	class="{!premium &&
		(expanded
			? 'bg-[#201E1E]'
			: 'bg-[#13100F]')} max-w-max -sm:max-w-[130px] w-full gap-x-4 font-paralucent-demibold flex items-center justify-center text-[#FFFFFFCC] {!premium &&
		'hover:border-[#42403F]'} text-sm duration-150 p-[5px] rounded-[11px] border-[#FFFFFF1A] border pr-5 relative"
	on:click={() => (expanded = !expanded)}
>
	<div
		class="p-1 {expanded
			? 'bg-[transparent]'
			: 'bg-[transparent]'} rounded-[8px] w-[40px] h-[40px] flex-shrink-0 grid place-items-center duration-150"
	>
		{#if userService.authUser}
			<img
				src={userService.authUser.user_metadata.avatar_url}
				alt=""
				class="object-cover w-full rounded-full aspect-square"
			/>
			<!-- <ProfileIcon /> -->
		{:else}
			<ProfileIcon />
		{/if}
	</div>

	<div class="uppercase truncate">
		{$auth_user?.username || $auth_email?.substring(0, 8) + '...'}
	</div>

	{#if expanded}
		<div class="absolute right-0 top-16">
			<ProfileDropdown
				absolute={false}
				onClickLogout={() => {
					displayLogoutPopup.set(true);
					open = false;
				}}
			/>
		</div>
	{/if}
</button>
