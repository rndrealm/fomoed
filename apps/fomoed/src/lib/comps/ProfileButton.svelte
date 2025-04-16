<script>
	import { auth_email, auth_user } from '$lib/stores/user';
	import ProfileDropdown from './ProfileDropdown.svelte';

	let expanded = false;

	$: premium = $auth_user?.has_valid_sub;

	const premiumBorderCollapsed =
		'background: linear-gradient( #13100F, #13100F) padding-box, linear-gradient(90deg, #FF3B10 0%, #F3C111 71.5%) border-box';

	const premiumBorderExpanded =
		'background: linear-gradient( #201E1E, #201E1E) padding-box, linear-gradient(90deg, #FF3B10 0%, #F3C111 71.5%) border-box';
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
		class="{expanded
			? 'bg-[#373534]'
			: 'bg-[#221F1D]'} rounded-[8px] w-[40px] h-[40px] flex-shrink-0 grid place-items-center duration-150"
	>
		<img src="/images/indicator-meme-5.png" width={17} height={13} alt="Arrow right" />
	</div>

	<div class="uppercase truncate">
		{$auth_user?.username || $auth_email?.substring(0, 8) + '...'}
	</div>

	{#if expanded}
		<div class="absolute top-16 right-0">
			<ProfileDropdown></ProfileDropdown>
		</div>
	{/if}
</button>
