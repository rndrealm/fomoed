import type { InsertOmit, NewsLikeRow } from '$ts/common/db.types';
import { BaseService } from './BaseService.client.svelte';
import type { AppNewsItem } from './NewsService.client.svelte';
import { userService } from './UserService.svelte';

class LikesService extends BaseService {
	async toggleLikeNewsPost(appNewsItem: AppNewsItem): Promise<boolean> {
		if (!userService.authUser) {
			return false;
		}

		if (appNewsItem.userLiked) {
			return this.unlikeNewsPost(appNewsItem);
		} else {
			return this.likeNewsPost(appNewsItem);
		}
	}

	async likeNewsPost(appNewsItem: AppNewsItem): Promise<boolean> {
		if (!userService.authUser) {
			return false;
		}

		appNewsItem.likes_count += 1;
		appNewsItem.userLiked = true;

		const row: InsertOmit<NewsLikeRow> = {
			news_id: appNewsItem.id,
			user_id: userService.authUser.id
		};

		const { error } = await this.supabase.from('news_likes').insert([row]);

		if (error) {
			appNewsItem.likes_count -= 1;
			appNewsItem.userLiked = false;

			return false;
		}

		return true;
	}

	async unlikeNewsPost(appNewsItem: AppNewsItem): Promise<boolean> {
		if (!userService.authUser) {
			return false;
		}

		appNewsItem.likes_count -= 1;
		appNewsItem.userLiked = false;

		const { error } = await this.supabase.from('news_likes').delete().match({
			news_id: appNewsItem.id,
			user_id: userService.authUser.id
		});

		if (error) {
			appNewsItem.likes_count += 1;
			appNewsItem.userLiked = true;

			return false;
		}

		return true;
	}
}

export const likesService = new LikesService();
