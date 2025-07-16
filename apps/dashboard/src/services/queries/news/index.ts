import api from "@/services/api";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { CryptopanicPost, NewsRowInsert, NewsFeedItem } from "./types";
import {
  fetchNewslabPosts,
  fetchPopularNews,
  fetchSingleNewslabPosts,
  fetchNewsFeed,
  fetchInfiniteNewsFeed,
  fetchSingleNewsArticle,
} from "./actions";

export const useFetchTokenNews = () => {
  const hash = ["news"];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/news`,
      });
      return response.data as CryptopanicPost[];
    },
    staleTime: Infinity,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

export const useReadTokenNews = (token: string = "BTC", start?: boolean) => {
  const hash = ["token-news", token];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchPopularNews(token);
      return response as NewsRowInsert[];
    },
    refetchInterval: 1000 * 60 * 5,
    enabled: start,
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

export const useReadNewslabPosts = (page: number = 1) => {
  const limit = 20;
  const hash = ["news-lab-posts", page];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchNewslabPosts(page, limit);
      return response as { data: NewsRowInsert[]; count: number };
    },
  });
  return {
    data: data?.data,
    isPending,
    isSuccess,
    error,
    meta: {
      count: data?.count || limit,
      limit,
      page,
    },
  };
};
export const useReadSingleNewslabPost = (id: string = "") => {
  const hash = ["news-lab-post", id];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchSingleNewslabPosts(id);
      return response as NewsRowInsert;
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
export const useReadNewslabContent = (id: string = "") => {
  const hash = ["news-lab-content", id];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/newslab-posts/${id}`,
      });
      return response;
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

// Notes on this hook
// It takes an optional token, page, and limit
// If token is provided, it fetches news related to that token
// If no token is provided, it fetches all news
// Use page and limit to control how many items are fetched eg page = 1 and limit = 20 will fetch the first 20 items
export const useReadNewsFeed = (token?: string, page?: number, limit?: number) => {
  const hash = ["news-feed", token, page, limit];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchNewsFeed(token, page, limit);
      return response as NewsFeedItem[];
    },
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes
  });

  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

// Notes on this hook
// Use fetchNextPage to fetch paginated news feed items
// Use (hasNextPage && !isFetchingNextPage) to check before fetching next page
// Use isFetchingNextPage to show loading state for next page
// It takes an optional token
// If token is provided, it fetches news related to that token
// If no token is provided, it fetches all news
export const useReadInfiniteNewsFeed = (token?: string) => {
  const hash = ["infinite-news-feed", token];
  const { data, isPending, error, isSuccess, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: hash,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchInfiniteNewsFeed(pageParam, 20, token);
      return response as NewsFeedItem[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      // If the last page has fewer than 20 items, we've reached the end
      if (lastPage.length < 20) return undefined;
      return pages.length + 1;
    },
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 2,
  });

  return {
    data: data?.pages.flat() || [], // Flatten all pages into a single array
    isPending,
    isSuccess,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

// This function fetches a single news article by its ID
export const useReadSingleNewsArticle = (id: string) => {
  const hash = ["news-article", id];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchSingleNewsArticle(id);
      return response as NewsRowInsert;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
