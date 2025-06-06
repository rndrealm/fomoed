import { getServerClient } from '$ts/utils/server/supabase';

const supabase = getServerClient();

export type NewsRowInsert = {
	id: string;
	title: string;
	original_url: string;
	published_at: string;
	source: string;
	likes_count: number;
	comments_count: number;
	image_url: string | null;
	sentiment: 'bullish' | 'bearish' | 'neutral';
	summary: string;
	symbols: string[];
	metadata: Record<string, any>;
};

export type NewsRow = NewsRowInsert & {
	created_at: number;
};

export class NewsTable {
	static async upsert(news: Partial<NewsRowInsert>[]) {
		const { error } = await supabase.from('news').upsert(news);

		if (error) {
			console.error('Error inserting news:', error);
		}
	}

	static async getById(id: string): Promise<NewsRow | null> {
		const { data, error } = await supabase.from('news').select('*').eq('id', id).single();

		if (error) {
			console.log(error);
			return null;
		}

		return data;
	}
}
