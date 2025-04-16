<script lang="ts">
	import { page } from '$app/stores';
	import CopyShare from '$lib/icons/CopyShare.svelte';
	import FacebookShare from '$lib/icons/FacebookShare.svelte';
	import TwitterXShare from '$lib/icons/TwitterXShare.svelte';
	import { aped_score, show_social_share } from '$lib/stores';
	import { copy_social_link, success, type SocialSites } from '$lib/utils';
	import type { ComponentType } from 'svelte';

	const socials: {
		icon: ComponentType;
		platform: SocialSites;
		render_as: 'link' | 'button';
	}[] = [
		{
			icon: TwitterXShare,
			platform: 'twitter',
			render_as: 'link'
		},
		{
			icon: FacebookShare,
			platform: 'facebook',
			render_as: 'link'
		},
		{
			icon: CopyShare,
			platform: 'copy',
			render_as: 'button'
		}
	];
</script>

{#if $show_social_share}
	<button
		class="fixed top-0 bottom-0 left-0 right-0 bg-black bg bg-opacity-80"
		on:click={() => {
			show_social_share.set(false);
		}}
	></button>
	<div
		class="social_share_popup fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[330px] h-[200px] bg-background rounded
      px-4 py-2 flex items-center flex-col justify-center z-50
    "
	>
		<div class="w-full pb-5 header">
			<button
				class="float-right font-mono text-xl close"
				on:click={() => show_social_share.set(false)}
			>
				x
			</button>
		</div>
		<ul class="flex items-center w-full rounded links justify-evenly h-1/2 bg-slate-600">
			{#each socials as social}
				<li class="h-1/2">
					{#if social.render_as === 'button'}
						<button
							on:click={() => {
								navigator.clipboard.writeText(
									copy_social_link(
										social.platform,
										`${$page.url.origin}?score=${+$aped_score.toFixed(2)}`
									)
								);
								success('Success: Copied Share Link to Clipboard');
								return;
							}}
							class="flex flex-col items-center justify-center h-full"
						>
							<svelte:component this={social.icon} />
						</button>
					{:else}
						<a
							href={copy_social_link(
								social.platform,
								`${$page.url.origin}?score=${+$aped_score.toFixed(2)}`
							)}
							target="_blank"
							class="flex flex-col items-center justify-center h-full"
						>
							<svelte:component this={social.icon} />
						</a>
					{/if}
				</li>
			{/each}
		</ul>
		<button
			class="py-4 font-mono text-xs link_text h-1/4"
			on:click={() => {
				navigator.clipboard.writeText(
					copy_social_link('copy', `${$page.url.origin}?score=${+$aped_score.toFixed(2)}`)
				);
				success('Success: Copied Share Link to Clipboard');
			}}
		>
			{copy_social_link('copy', `${$page.url.origin}?score=${+$aped_score.toFixed(2)}`)}
		</button>
	</div>
{/if}
