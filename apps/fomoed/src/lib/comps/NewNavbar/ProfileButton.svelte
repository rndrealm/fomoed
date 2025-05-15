<script>
	import ProfileIcon from '$lib/icons/ProfileIcon.svelte';
	import { userService } from '$ts/client/services/UserService.svelte';

	// Import Shadcn popover components
	import * as Popover from '$lib/components/ui/popover';
	import ProfileDropdown from '../ProfileDropdown.svelte';
	import { browser } from '$app/environment';
	import LoginButton from '../buttons/LoginButton.svelte';
	import { displayLogoutPopup } from '$lib/stores/ui';

	let open = $state(false);
</script>

{#if browser}
	<Popover.Root bind:open>
		<Popover.Trigger>
			<button class="h-[40px] aspect-square rounded-full grid place-items-center p-1">
				<div
					class="border border-[#2B2B2B] bg-[#110F0E] rounded-full size-full grid place-items-center"
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
			</button>
		</Popover.Trigger>

		<Popover.Content class="h-[260px] bg-transparent border-none px-4 w-min">
			{#if userService.authUser}
				<ProfileDropdown
					absolute={false}
					onClickLogout={() => {
						displayLogoutPopup.set(true);
						open = false;
					}}
				/>
			{:else}
				<div
					class="w-[200px] bg-[#0F0D0DE5] border-[#FFFFFF1A] rounded-[10px] py-8 flex-col items-center right-0 top-0 border backdrop-blur-lg z-40 grid place-items-center"
				>
					<LoginButton />
				</div>
			{/if}
		</Popover.Content>
	</Popover.Root>
{/if}

<style>
	button {
		background: radial-gradient(
			248.97% 177.44% at 50% -53.89%,
			#020100 18.5%,
			#631b06 39.5%,
			#8b2505 57.5%,
			#bd4618 80%,
			#f7984b 91.04%
		);
	}
</style>
