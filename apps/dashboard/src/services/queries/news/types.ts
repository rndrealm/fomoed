export type NewsFeedResponseData = {
  postIds: string[];
  count: number;
  next: string | null;
  previous: string | null;
};

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

interface PostInstrument {
  code: string;
  title: string;
  slug: string;
  url: string;
}

export interface CryptopanicPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  published_at: string;
  created_at: string;
  kind: string;
  source: {
    title: string;
    region: string;
    domain: string;
    type: string;
  };
  original_url: string;
  url: string;
  image: string;
  instruments: Array<PostInstrument>;
  votes: {
    negative: number;
    positive: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
  };
  panic_score: number;
  author: string;
}
// export interface CryptopanicPost {
//   kind: string;
//   domain: string;
//   source: Source;
//   title: string;
//   published_at: string;
//   url: string;
//   slug: string;
//   // Some posts might not have a currencies array
//   currencies?: Currency[];
//   id: number;
//   created_at: string;
//   votes: Votes;
//   metadata: Metadata;
// }

export interface CryptopanicNewsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CryptopanicPost[];
}

export type NewsRowInsert = {
  id: string;
  title: string;
  original_url: string;
  published_at: string;
  source: string;
  likes_count: number;
  comments_count: number;
  image_url: string | null;
  sentiment: "bullish" | "bearish" | "neutral";
  summary: string;
  symbols: string[];
};

export type ApiNewsLabPost = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  metadata: {
    ref_tokens: string[];
  };
};
