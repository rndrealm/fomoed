export interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  isLive?: boolean;
  videoType?: "video" | "short" | "live";
  type?: "video" | "channel";
  channelId?: string;
  subscriberCount?: string;
  videoCount?: string;
}

export type VideoFilter = "all" | "video" | "short" | "live";
export type SearchFilter = "all" | "video" | "short" | "live" | "channel";

export interface ChannelDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  bannerUrl?: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  customUrl?: string;
}

export interface SearchState {
  results: SearchResult[];
  nextPageToken: string | null;
  isLoading: boolean;
  hasMore: boolean;
}
