export interface IdMixin {
	id: string;
}

export interface PostUserInteractionMixin {
	userLiked: boolean;
	userBookmarked: boolean;
}

export interface DetailUrlMixin {
	detailUrl: string;
}

export type PostSentiment = 'bullish' | 'bearish' | 'neutral';

export type PostLike = {
	id: string;
	title: string;
	summary: string;
	image_url: string | null;
	source: string;
	published_at: string;
	sentiment: PostSentiment;
	symbols: string[];
	likes_count: number;
	comments_count: number;
	allowInteraction: boolean;
} & DetailUrlMixin &
	PostUserInteractionMixin;
