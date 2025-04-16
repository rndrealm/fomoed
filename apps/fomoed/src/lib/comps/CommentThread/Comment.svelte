<script lang="ts">
	import type { AppComment } from '$ts/client/services/CommentsService.client.svelte';
	import { commentsService } from '$ts/client/services/CommentsService.client.svelte';
	import { userService } from '$ts/client/services/UserService.svelte';
	import { timeAgo } from '$ts/client/utils';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import Self from './Comment.svelte';
	import type { AppNewsItem } from '$ts/client/services/NewsService.client.svelte';
	import { slide } from 'svelte/transition';
	import { EditIcon, HeartIcon, PencilIcon, ReplyIcon, TrashIcon, UserIcon } from 'lucide-svelte';
	import { min } from 'lodash-es';

	let {
		comment,
		newsItem,
		showReplies = true,
		isReply = false,
		onDelete = (oldComment: AppComment) => {}
	}: {
		comment: AppComment;
		newsItem: AppNewsItem;
		showReplies?: boolean;
		isReply?: boolean;
		onDelete?: (oldComment: AppComment) => void;
	} = $props();

	let isReplying = $state(false);
	let isEditing = $state(false);
	let showDeleteDialog = $state(false);
	let newContent = $state('');
	let replyContent = $state('');
	let textareaRef = $state<HTMLTextAreaElement | null>(null);
	let replyTextareaRef = $state<HTMLTextAreaElement | null>(null);
	let isRootComment = $state(!comment.parent_id);

	function toggleReply() {
		isReplying = !isReplying;
		if (isReplying) {
			replyContent = '';
		}
	}

	function toggleEdit() {
		isEditing = !isEditing;
		if (isEditing) {
			newContent = comment.content;
		}
	}

	async function submitReply() {
		if (!replyContent.trim()) return;

		const newReply = await commentsService.addComment(newsItem, replyContent, comment.id);

		if (newReply) {
			// Initialize replies array if it doesn't exist
			if (!comment.replies) {
				comment.replies = [];
			}

			// Add the new reply to the parent comment's replies array
			comment.replies = [newReply, ...comment.replies];

			// Update reply count
			comment.reply_count = (comment.reply_count || 0) + 1;

			// Make sure replies are visible
			showReplies = true;

			// Reset the reply form
			isReplying = false;
			replyContent = '';
		}
	}

	async function submitEdit() {
		if (!newContent.trim() || newContent === comment.content) {
			isEditing = false;
			return;
		}

		const updatedComment = await commentsService.updateComment(comment.id, newContent);

		if (updatedComment) {
			comment.content = updatedComment.content;
			isEditing = false;
		}
	}

	async function deleteComment() {
		showDeleteDialog = true;
	}

	async function confirmDelete() {
		const success = await commentsService.deleteComment(comment.id, newsItem);

		showDeleteDialog = false;

		if (success) {
			onDelete(comment);
		}
	}

	async function loadReplies() {
		const replies = await commentsService.fetchReplies(comment);

		if (replies.length > 0) {
			const updatedComment = { ...comment, replies };
			comment = updatedComment;
			showReplies = true;
		}
	}

	async function toggleLike() {
		if (!userService.authUser) return;

		const result = await commentsService.toggleLike(comment);

		if (result) {
			comment = result;
		}
	}

	const isCurrentUser = $derived(userService.authUser?.id === comment.user_id);

	function handleCmdEnterSubmit(event: KeyboardEvent, action: () => void, content: string) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			if (content.trim()) {
				action();
			}
		}
	}

	$effect(() => {
		if (isEditing && textareaRef) {
			textareaRef.focus();
		} else if (isReplying && replyTextareaRef) {
			replyTextareaRef.focus();
		}
	});

	$inspect(comment, 'comment');
</script>

<div
	class={`p-4 border-b bg-[#151515] rounded-lg border-[0.5px] border-[#333333] overflow-hidden ${isRootComment ? 'min-w-[300px]' : 'min-w-max'} ${isReply ? 'dekstop:ml-8' : ''} comment-container`}
	class:max-w-full={isRootComment}
	transition:slide
>
	<div class="flex flex-col overflow-hidden" class:min-w-max={!isRootComment}>
		<!-- Comment header with user info -->
		<div class="flex items-start justify-between">
			<!-- Avatar and username/timestamp section -->
			<div class="flex items-start space-x-3">
				<div class="flex-shrink-0">
					<Avatar class="w-10 h-10">
						{#if comment.public_user_data.avatar_url}
							<AvatarImage
								src={comment.public_user_data.avatar_url}
								alt={comment.public_user_data.display_name}
							/>
						{:else if comment.public_user_data.display_name}
							<AvatarFallback class="bg-neutral-700 text-neutral-200">
								{comment.public_user_data.display_name?.charAt(0).toUpperCase()}
							</AvatarFallback>
						{:else}
							<AvatarFallback class="bg-neutral-700 text-neutral-200">
								<UserIcon />
							</AvatarFallback>
						{/if}
					</Avatar>
				</div>

				<div class="flex-col">
					<div class="flex flex-col items-start">
						<span class="font-medium text-white">
							{#if comment.public_user_data.display_name}
								{comment.public_user_data.display_name}
							{:else}
								Anonymous User
							{/if}
						</span>

						<span class="text-xs text-neutral-400 pt-1 whitespace-nowrap">
							{timeAgo(comment.updated_at)}

							{#if comment.updated_at !== comment.created_at}
								(edited)
							{/if}
						</span>
					</div>
				</div>
			</div>

			<!-- Comment actions -->
			<div class="flex space-x-2 text-xs action-buttons">
				{#if !comment.deleted && !isReplying && !isEditing}
					<Button
						variant="ghost"
						size="sm"
						onclick={toggleReply}
						class="text-neutral-500 hover:text-orange-400 px-1 h-auto hover:bg-transparent flex items-center gap-1"
					>
						<ReplyIcon class="h-3.5 w-3.5" />
					</Button>

					<Button
						variant="ghost"
						size="sm"
						onclick={toggleLike}
						class="text-neutral-500 hover:text-orange-400 px-1 h-auto hover:bg-transparent flex items-center gap-1"
						aria-label={comment.liked_by_user ? 'Unlike' : 'Like'}
					>
						<HeartIcon class="h-3.5 w-3.5" fill={comment.liked_by_user ? 'currentColor' : 'none'} />
						{#if comment.like_count && comment.like_count > 0}
							<span class="text-xs ml-1">{comment.like_count}</span>
						{/if}
					</Button>

					{#if isCurrentUser}
						<Button
							variant="ghost"
							size="sm"
							onclick={toggleEdit}
							class="text-neutral-500 hover:text-orange-400 px-1 h-auto hover:bg-transparent"
						>
							<PencilIcon class="h-3.5 w-3.5" />
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onclick={deleteComment}
							class="text-neutral-500 hover:text-orange-400 px-1 h-auto hover:bg-transparent"
						>
							<TrashIcon class="h-3.5 w-3.5" />
						</Button>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Comment content section - positioned beneath the header -->
		<div class="mt-2 ml-13" class:min-w-max={!isRootComment}>
			<!-- Comment content -->
			<div class="mt-1">
				{#if isEditing}
					<Textarea
						bind:ref={textareaRef}
						bind:value={newContent}
						class="comment-textarea"
						rows={3}
						onkeydown={(e) => handleCmdEnterSubmit(e, submitEdit, newContent)}
					/>
					<div class="flex space-x-2 mt-2">
						<div class="flex-grow"></div>
						<Button variant="secondary" size="sm" onclick={toggleEdit}>Cancel</Button>
						<Button variant="default" size="sm" onclick={submitEdit} class="primary-action-btn">
							Save
						</Button>
					</div>
				{:else}
					<p class="text-gray-200">
						{#if comment.deleted}
							<span class="italic text-gray-400">&lt;deleted&gt;</span>
						{:else}
							{comment.content}
						{/if}
					</p>
				{/if}
			</div>

			<!-- Reply form -->
			{#if isReplying && !comment.deleted}
				<div class="mt-3">
					<Textarea
						bind:ref={replyTextareaRef}
						bind:value={replyContent}
						placeholder="Write a reply..."
						class="comment-textarea"
						rows={2}
						onkeydown={(e) => handleCmdEnterSubmit(e, submitReply, replyContent)}
					/>

					<div class="flex space-x-2 mt-2">
						<div class="flex-grow"></div>
						<Button variant="secondary" size="sm" onclick={toggleReply}>Cancel</Button>
						<Button
							variant="default"
							size="sm"
							onclick={submitReply}
							disabled={!replyContent.trim()}
							class="primary-action-btn"
						>
							Reply
						</Button>
					</div>
				</div>
			{/if}

			<!-- Display reply count and load replies button -->
			{#if comment.reply_count > 0 && !showReplies && !comment.replies?.length}
				<Button
					variant="link"
					size="sm"
					onclick={loadReplies}
					class="mt-2 text-blue-400 hover:text-blue-300 p-0 h-auto"
				>
					Show {comment.reply_count}
					{comment.reply_count === 1 ? 'reply' : 'replies'}
				</Button>
			{/if}

			<!-- Display replies -->
			{#if showReplies && comment.replies && comment.replies.length > 0}
				<div
					class="mt-4 gap-y-3 grid"
					class:overflow-x-scroll={isRootComment}
					class:min-w-max={!isRootComment}
				>
					{#each comment.replies as reply}
						<Self comment={reply} {newsItem} isReply={true} showReplies={false} {onDelete} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Delete Confirmation Dialog -->
<Dialog open={showDeleteDialog} onOpenChange={(open) => (showDeleteDialog = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Comment</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this comment? This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={confirmDelete}>Delete</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<style>
	.comment-container {
		position: relative;
	}

	.comment-container .action-buttons {
		@apply -desktop:!opacity-100;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.comment-container:hover .action-buttons {
		opacity: 1;
	}

	/* Extracted common styles */
	:global(.comment-textarea) {
		resize: none;
		@apply focus-visible:ring-0 focus-visible:border-[#d5682dcc] border-[0.5px] border-[#333333] bg-[#151515] text-white;
	}

	:global(.primary-action-btn) {
		@apply border-[#d5682d] border font-bold bg-[#741f06];
	}
</style>
