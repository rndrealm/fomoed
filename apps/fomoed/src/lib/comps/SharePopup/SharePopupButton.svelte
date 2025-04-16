<script lang="ts">
	import ShareIconCopyLink from '$lib/icons/share-popup/ShareIconCopyLink.svelte';
	import ShareIconFacebook from '$lib/icons/share-popup/ShareIconFacebook.svelte';
	import ShareIconTelegram from '$lib/icons/share-popup/ShareIconTelegram.svelte';
	import ShareIconWhatsApp from '$lib/icons/share-popup/ShareIconWhatsApp.svelte';
	import ShareIconX from '$lib/icons/share-popup/ShareIconX.svelte';
	import ShareIcon from '$lib/icons/ShareIcon.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { type Component } from 'svelte';
	import toast from 'svelte-french-toast';

	let { postUrl }: { postUrl: string } = $props();

	// Track popover open state
	let open = $state(false);
</script>

{#snippet shareButton(Icon: Component, label: string, cb: () => void)}
	<button
		onclick={() => {
			cb();
			open = false;
		}}
		class="flex flex-col items-center gap-y-2 hover:bg-white/10 p-2 rounded-lg active:scale-95 transition-all duration-100"
	>
		<Icon />
		<span class="text-xs text-gray-300 whitespace-nowrap font-mono">{label}</span>
	</button>
{/snippet}

<!-- Share button with popup -->
<Popover.Root bind:open>
	<Popover.Trigger asChild>
		<button class="p-2">
			<ShareIcon />
		</button>
	</Popover.Trigger>

	<Popover.Content
		class="z-10 shadow-lg px-4 py-2 bg-[#1C1C1C] border border-[#333333] rounded-lg flex gap-x-2 desktop:min-w-max -desktop:flex-wrap justify-center"
		align="end"
		sideOffset={5}
	>
		{@render shareButton(ShareIconWhatsApp, 'WhatsApp', () => {
			const url = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
			window.open(url, '_blank');
		})}
		{@render shareButton(ShareIconX, 'Twitter(x)', () => {
			const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`;
			window.open(url, '_blank');
		})}
		{@render shareButton(ShareIconFacebook, 'Facebook', () => {
			const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
			window.open(url, '_blank');
		})}
		{@render shareButton(ShareIconTelegram, 'Telegram', () => {
			const url = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}`;
			window.open(url, '_blank');
		})}
		{@render shareButton(ShareIconCopyLink, 'Copy Link', () => {
			navigator.clipboard.writeText(postUrl);
			toast.success('Copied post URL to clipboard');
		})}
	</Popover.Content>
</Popover.Root>
