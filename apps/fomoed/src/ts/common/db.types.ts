export interface NewsLikeRow {
	id: string;
	user_id: string;
	news_id: string;
	created_at: string;
}

export interface NewsBookmarkRow {
	id: string;
	user_id: string;
	news_id: string;
	created_at: string;
}

export type InsertOmit<T> = Omit<T, 'id' | 'created_at'>;

export type CommentRow = {
	id: number;
	news_id: string;
	user_id: string;
	parent_id: number | null;
	content: string;
	deleted: boolean;
	created_at: string;
	updated_at: string;
};

export interface PublicUserDataRow {
	user_id: string;
	display_name: string | null;
	avatar_url: string | null;
	created_at: string;
}

export interface CommentLikesRow {
	user_id: string;
	comment_id: number;
	created_at: string;
}
