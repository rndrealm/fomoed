<script lang="ts">
	import { commentsService } from '$ts/client/services/CommentsService.client.svelte';
	import { userService } from '$ts/client/services/UserService.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { AppComment } from '$ts/client/services/CommentsService.client.svelte';
	import type { PostLike } from '$ts/client/types/posts';

	let {
		newsItem,
		onCommentAdded = () => {}
	}: {
		newsItem: PostLike;
		onCommentAdded?: (comment: AppComment) => void;
	} = $props();

	let content = $state('');
	let isSubmitting = $state(false);
	let isLoggedIn = $derived(userService.authUser !== null);

	async function handleSubmit() {
		if (!content.trim() || !isLoggedIn) return;

		isSubmitting = true;

		const comment = await commentsService.addComment(newsItem, content, null);

		isSubmitting = false;

		if (comment !== null) {
			onCommentAdded(comment);
			content = '';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			if (content.trim() && !isSubmitting && isLoggedIn) {
				handleSubmit();
			}
		}
	}
</script>

<!-- Comment input container -->
<div class="space-y-4 w-full">
	<div class="text-sm text-neutral-600 font-semibold">Post a comment</div>

	<Textarea
		placeholder={isLoggedIn ? 'This is great news!' : 'Login to comment'}
		bind:value={content}
		disabled={isSubmitting || !isLoggedIn}
		rows={3}
		class="resize-none focus-visible:ring-0 focus-visible:border-[#d5682dcc] border border-[#333333] bg-[#151515] text-white"
		onkeydown={handleKeydown}
	/>

	<div class="flex justify-end">
		<Button
			onclick={handleSubmit}
			disabled={isSubmitting || !content.trim() || !isLoggedIn}
			variant="default"
			class="border-[#d5682d] border font-bold bg-[#741f06]"
		>
			{#if isSubmitting}
				<span class="mr-2">
					<!-- Loading spinner -->
					<div
						class="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin"
					></div>
				</span>
				Posting comment...
			{:else}
				Post comment
			{/if}
		</Button>
	</div>
</div>
