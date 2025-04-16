import type { InsertOmit, NewsBookmarkRow } from '$ts/common/db.types';
import { BaseService } from './BaseService.client.svelte';
import type { AppNewsItem } from './NewsService.client.svelte';
import { userService } from './UserService.svelte';

class BookmarksService extends BaseService {
	async toggleBookmarkNewsPost(appNewsItem: AppNewsItem): Promise<boolean> {
		if (!userService.authUser) {
			return false;
		}

		if (appNewsItem.userBookmarked) {
			return this.unbookmarkNewsPost(appNewsItem);
		} else {
			return this.bookmarkNewsPost(appNewsItem);
		}
	}

	async bookmarkNewsPost(appNewsItem: AppNewsItem): Promise<boolean> {
		if (!userService.authUser) {
			return false;
		}

		appNewsItem.userBookmarked = true;

		const row: InsertOmit<NewsBookmarkRow> = {
			news_id: appNewsItem.id,
			user_id: userService.authUser.id
		};

		const { error } = await this.supabase.from('news_bookmarks').insert([row]);

		if (error) {
			appNewsItem.userBookmarked = false;

			return false;
		}

		return true;
	}

	async unbookmarkNewsPost(appNewsItem: AppNewsItem): Promise<boolean> {
		if (!userService.authUser) {
			return false;
		}

		appNewsItem.userBookmarked = false;

		const { error } = await this.supabase.from('news_bookmarks').delete().match({
			news_id: appNewsItem.id,
			user_id: userService.authUser.id
		});

		if (error) {
			appNewsItem.userBookmarked = true;

			return false;
		}

		return true;
	}
}

export const bookmarksService = new BookmarksService();
