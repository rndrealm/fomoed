<script lang="ts">
	import type { AppComment } from '$ts/client/services/CommentsService.client.svelte';
	import Comment from './Comment.svelte';
	import CommentInput from '$lib/comps/CommentInput/CommentInput.svelte';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import type { PostLike } from '$ts/client/types/posts';

	let {
		comments: initialComments = [],
		newsItem,
		onCommentAdded = (comment: AppComment) => {}
	}: {
		comments: AppComment[];
		newsItem: PostLike;
		onCommentAdded?: (comment: AppComment) => void;
	} = $props();

	let comments = $state(initialComments);
	let rerenderCommentsHelper = $state(0);

	function handleCommentAdded(comment: AppComment) {
		// Add the new comment to the beginning of the array
		comments = [comment, ...comments];
		// Also call the parent callback if provided
		onCommentAdded(comment);
	}

	function handleCommentDeleted(oldCommet: AppComment) {
		if (!oldCommet.parent_id) {
			comments = comments.filter((c) => c.id !== oldCommet.id);
		} else {
			window.location.reload();
		}
	}
</script>

<div id="comments" class="space-y-4 overflow-hidden w-full">
	<!-- Comment input -->
	<CommentInput {newsItem} onCommentAdded={handleCommentAdded} />

	{#if comments.length === 0}
		<!-- Empty state -->
		<div class="text-center py-4 text-neutral-500 text-sm font-semibold">
			No comments yet. Be the first to comment!
		</div>
	{:else}
		<!-- Comments list -->
		{#each comments as comment (comment.id)}
			<Comment {comment} {newsItem} onDelete={handleCommentDeleted} />
		{/each}
	{/if}
</div>
