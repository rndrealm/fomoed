export type ServerResponse = { success: true; data: any } | { success: false; message: string };

export type TypedServerResponse<T> =
	| { success: true; data: T }
	| { success: false; message: string };

export type NewsFeedResponseData = {
	postIds: string[];
	count: number;
	next: string | null;
	previous: string | null;
};
