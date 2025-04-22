import { PUBLIC_NEWSLAB_URL } from '$env/static/public';
import toast from 'svelte-5-french-toast';
import type { PostLike } from '../types/posts';

type ApiNewsLabPost = {
	id: string;
	title: string;
	content: string;
	created_at: string;
	metadata: {
		ref_tokens: string[];
	};
};

export class NewsLabPostsService {
	posts = $state<PostLike[]>([]);

	async fetchPosts(): Promise<void> {
		const url = new URL('/api/newslab-posts', PUBLIC_NEWSLAB_URL);

		let res: Response;

		try {
			res = await fetch(url);
		} catch (error) {
			toast.error('Failed to fetch newslab posts');
			return;
		}

		let json: ApiNewsLabPost[];

		try {
			json = await res.json();
		} catch {
			toast.error('Failed to parse newslab posts');
			return;
		}

		const posts: PostLike[] = [];

		for (const post of json) {
			const appPost: PostLike = {
				...post,
				summary: '',
				image_url: '',
				source: 'NewsLab',
				published_at: post.created_at,
				sentiment: 'neutral',
				symbols: post.metadata.ref_tokens,
				likes_count: 0,
				comments_count: 0,
				detailUrl: '',
				userLiked: false,
				userBookmarked: false,
                allowInteraction: false
			};

			posts.push(appPost);
		}

		this.posts = posts;
	}
}

export const newsLabPostsService = new NewsLabPostsService();
