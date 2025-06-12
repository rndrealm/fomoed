import { BaseService } from './BaseService.client.svelte';
import type { CommentLikesRow, CommentRow, PublicUserDataRow } from '$ts/common/db.types';
import { userService } from './UserService.svelte';
import type { PostLike } from '$ts/client/types/posts';

export type AppComment = CommentRow & {
	public_user_data: PublicUserDataRow;
	replies?: AppComment[];
	reply_count: number;
	parent_comment?: WeakRef<AppComment> | null;
	liked_by_user?: boolean;
	like_count?: number;
	user_likes: CommentLikesRow;
};

export class CommentsService extends BaseService {
	private readonly COMMENTS_SELECT =
		// '*, users:users!comments_user_id_fkey1(*), reply_count:comments!parent_id(count), user_likes:comment_likes!id(*)';
		'*, public_user_data(user_id, display_name, avatar_url), reply_count:comments!parent_id(count), user_likes:comment_likes!id(*)';

	async fetchComments(newsId: string, loadReplies = false): Promise<AppComment[] | null> {
		if (!this.supabase) {
			console.error('Supabase client not available');
			return null;
		}

		const query = this.supabase
			.from('comments')
			.select(this.COMMENTS_SELECT)
			.eq('news_id', newsId)
			.is('parent_id', null)
			.order('created_at', { ascending: false });

		const { data, error } = await query;

		console.log('data:', data);
		if (error) {
			console.error('Error fetching comments:', error);
			return null;
		}

		// Process the comments and format them for display
		const formattedComments: AppComment[] = [];

		for (const comment of data) {
			formattedComments.push({
				...comment,
				replies: [],
				reply_count: comment.reply_count?.[0]?.count || 0,
				liked_by_user: comment.user_likes[0]?.user_id === userService.authUser?.id,
				like_count: comment.user_like?.length || 0
			});
		}

		// If loadReplies is true, load the first level of replies for each comment
		if (loadReplies) {
			for (const comment of formattedComments) {
				if (comment.reply_count > 0) {
					const replies = await this.fetchReplies(comment);
					comment.replies = replies;
				}
			}
		}

		return formattedComments;
	}

	async fetchReplies(comment: AppComment): Promise<AppComment[]> {
		if (!this.supabase) {
			console.error('Supabase client not available');
			return [];
		}

		const { data, error } = await this.supabase
			.from('comments')
			.select(this.COMMENTS_SELECT)
			.eq('news_id', comment.news_id)
			.eq('parent_id', comment.id)
			.order('created_at', { ascending: true });

		if (error) {
			console.error('Error fetching replies:', error);
			return [];
		}

		// Format replies
		const formattedReplies: AppComment[] = [];

		for (const reply of data) {
			formattedReplies.push({
				...reply,
				replies: [],
				reply_count: reply.reply_count?.[0]?.count || 0,
				parent_comment: new WeakRef(comment)
			});
		}

		return formattedReplies;
	}

	async addComment(
		newsItem: PostLike,
		content: string,
		parentId: number | null = null
	): Promise<AppComment | null> {
		if (!this.supabase || !userService.authUser) {
			console.error('Supabase client not available or user not logged in');
			return null;
		}

		const { data, error } = await this.supabase
			.from('comments')
			.insert({
				news_id: newsItem.id,
				user_id: userService.authUser.id,
				parent_id: parentId,
				content
			})
			.select(this.COMMENTS_SELECT);

		if (error) {
			console.error('Error adding comment:', error);
			return null;
		}

		if (!data || data.length === 0) {
			console.error('No data returned after inserting comment');
			return null;
		}

		// Format the returned comment
		const newComment = {
			...data[0],
			replies: [],
			reply_count: 0
		} as AppComment;

		newsItem.comments_count = (newsItem.comments_count || 0) + 1;

		return newComment;
	}

	async updateComment(commentId: number, content: string): Promise<AppComment | null> {
		if (!this.supabase || !userService.authUser) {
			console.error('Supabase client not available or user not logged in');
			return null;
		}

		const { data, error } = await this.supabase
			.from('comments')
			.update({ content, updated_at: new Date().toISOString() })
			.eq('id', commentId)
			.eq('user_id', userService.authUser.id)
			.select(this.COMMENTS_SELECT);

		if (error) {
			console.error('Error updating comment:', error);
			return null;
		}

		if (!data || data.length === 0) {
			console.error('No data returned after updating comment');
			return null;
		}

		// Format the returned comment
		const updatedComment = {
			...data[0],
			replies: [],
			reply_count: 0
		} as AppComment;

		return updatedComment;
	}

	async deleteComment(commentId: number, newsItem: PostLike): Promise<boolean> {
		if (!this.supabase || !userService.authUser) {
			console.error('Supabase client not available or user not logged in');
			return false;
		}

		// Check if the comment has any replies
		const { data: replies, error: repliesError } = await this.supabase
			.from('comments')
			.select('id')
			.eq('parent_id', commentId)
			.limit(1);

		if (repliesError) {
			console.error('Error checking for replies:', repliesError);
			return false;
		}

		// If there are replies, mark as deleted instead of physically removing
		if (replies && replies.length > 0) {
			const { error: updateError } = await this.supabase
				.from('comments')
				.update({
					deleted: true,
					content: ''
				})
				.eq('id', commentId)
				.eq('user_id', userService.authUser.id);

			if (updateError) {
				console.error('Error marking comment as deleted:', updateError);
				return false;
			}
		} else {
			// No replies, perform physical deletion
			const { error: deleteError } = await this.supabase
				.from('comments')
				.delete()
				.eq('id', commentId)
				.eq('user_id', userService.authUser.id);

			if (deleteError) {
				console.error('Error deleting comment:', deleteError);
				return false;
			}
		}

		// Update the comment count on the news item
		newsItem.comments_count = Math.max(0, newsItem.comments_count - 1);

		return true;
	}

	async toggleLike(comment: AppComment): Promise<AppComment | false> {
		if (!this.supabase || !userService.authUser) {
			console.error('Supabase client not available or user not logged in');
			return false;
		}

		const isLiked = comment.liked_by_user;
		const currentLikeCount = comment.like_count || 0;

		// Update comment object optimistically
		comment.liked_by_user = !isLiked;
		comment.like_count = currentLikeCount + (!isLiked ? 1 : -1);

		// Perform the database operation
		if (isLiked) {
			const { error: deleteLikeError } = await this.supabase
				.from('comment_likes')
				.delete()
				.eq('comment_id', comment.id)
				.eq('user_id', userService.authUser.id);

			if (deleteLikeError) {
				console.error('Error removing like:', deleteLikeError);
				// Revert optimistic update
				comment.liked_by_user = isLiked;
				comment.like_count = currentLikeCount;
				return false; // Return false to indicate failure
			}
		} else {
			const { error: addLikeError } = await this.supabase.from('comment_likes').insert({
				comment_id: comment.id,
				user_id: userService.authUser.id
			});

			if (addLikeError) {
				console.error('Error adding like:', addLikeError);
				// Revert optimistic update
				comment.liked_by_user = isLiked;
				comment.like_count = currentLikeCount;
				return false; // Return false to indicate failure
			}
		}

		// API call succeeded, return the original comment which was updated
		return comment;
	}
}

export const commentsService = new CommentsService();
