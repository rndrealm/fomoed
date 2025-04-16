export interface CryptopanicNewsApiResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: CryptopanicPost[];
}

export interface CryptopanicPost {
	kind: string;
	domain: string;
	source: Source;
	title: string;
	published_at: string;
	url: string;
	slug: string;
	// Some posts might not have a currencies array
	currencies?: Currency[];
	id: number;
	created_at: string;
	votes: Votes;
	metadata: Metadata;
}

export interface Source {
	title: string;
	region: string;
	domain: string;
	path: string | null;
	type: string;
	url: string;
}

export interface Currency {
	code: string;
	title: string;
	slug: string;
	url: string;
}

export interface Votes {
	negative: number;
	positive: number;
	important: number;
	liked: number;
	disliked: number;
	lol: number;
	toxic: number;
	saved: number;
	comments: number;
}

export interface Metadata {
	image: string;
	description: string;
}
