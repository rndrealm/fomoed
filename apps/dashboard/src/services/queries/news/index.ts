import api from "@/services/api";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CryptopanicPost, NewsRowInsert, NewsFeedItem } from "./types";
import {
  fetchNewslabPosts,
  fetchPopularNews,
  fetchSingleNewslabPosts,
  fetchNewsFeed,
  fetchInfiniteNewsFeed,
  fetchSingleNewsArticle,
  fetchSimilarNewsFeed,
  addNewsBookmark,
  deleteNewsBookmark,
  checkNewsBookmark,
  searchNews,
  fetchUserBookmarkedNews,
} from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/routes";

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

  const {
    data,
    isPending,
    error,
    isSuccess,
  } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchNewsFeed(token, page, limit);

      if (!response || (response as any)?.error) {
        throw new Error((response as any)?.error || "Failed to fetch news feed");
      }

      return response as NewsFeedItem[];
    },
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 2,
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

// This hook fetches news articles for multiple tokens and returns a randomized selection
// It's useful for showing similar/related articles based on multiple symbols
export const useReadSimilarNewsFeed = (tokens?: string[] | null, limit: number = 3) => {
  const hash = ["similar-news-feed", tokens?.sort(), limit];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchSimilarNewsFeed(tokens || [], limit);
      return response as NewsFeedItem[];
    },
    enabled: !!tokens,
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 2,
  });

  return {
    data: data || [],
    isPending,
    isSuccess,
    error,
  };
};

export const useCheckNewsBookmark = (newsId: string) => {
  const hash = ["news-bookmark", newsId];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await checkNewsBookmark(newsId);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!newsId,
  });

  return {
    isBookmarked: data || false,
    isPending,
    isSuccess,
    error,
  };
};

export const useSearchNews = (searchTerm: string, page: number = 1, limit: number = 20, enabled: boolean = true) => {
  const hash = ["search-news", searchTerm, page, limit];
  const { data, isPending, error, isSuccess, isFetching } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await searchNews(searchTerm, page, limit);
      return response;
    },
    // enabled: enabled && searchTerm.trim().length > 3,
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    data: data?.data || [],
    count: data?.count || 0,
    isPending,
    isFetching,
    isSuccess,
    error,
  };
};

export const useAddNewsBookmark = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const response = await addNewsBookmark(newsId);
      return response;
    },
    onMutate: async (newsId) => {
      await queryClient.cancelQueries({ queryKey: ["news-bookmark", newsId] });

      const previousBookmark = queryClient.getQueryData(["news-bookmark", newsId]);

      queryClient.setQueryData(["news-bookmark", newsId], true);

      return { previousBookmark };
    },
    onError: (err: any, newsId, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(["news-bookmark", newsId], context?.previousBookmark);

      // Handle specific error types
      if (err.name === "UnauthorizedError") {
        toast.error("Please log in to bookmark news articles.");
        const currentUrl = window.location.pathname + window.location.search;
        router.push(AppRoutes.auth.login.withNext(currentUrl));
      } else {
        toast.error("Failed to add bookmark. Please try again.");
      }
    },
    onSettled: (data, error, newsId) => {
      queryClient.invalidateQueries({ queryKey: ["news-bookmark", newsId] });
      queryClient.invalidateQueries({ queryKey: ["news-feed"] });
      queryClient.invalidateQueries({ queryKey: ["popular-news"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookmarked-news"] });
    },
  });
};

export const useDeleteNewsBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const response = await deleteNewsBookmark(newsId);
      return response;
    },
    onMutate: async (newsId) => {
      await queryClient.cancelQueries({ queryKey: ["news-bookmark", newsId] });

      const previousBookmark = queryClient.getQueryData(["news-bookmark", newsId]);

      queryClient.setQueryData(["news-bookmark", newsId], false);

      return { previousBookmark };
    },
    onError: (err, newsId, context) => {
      queryClient.setQueryData(["news-bookmark", newsId], context?.previousBookmark);
      toast.error("Failed to remove bookmark. Please try again.");
    },
    onSettled: (data, error, newsId) => {
      queryClient.invalidateQueries({ queryKey: ["news-bookmark", newsId] });
      queryClient.invalidateQueries({ queryKey: ["news-feed"] });
      queryClient.invalidateQueries({ queryKey: ["popular-news"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookmarked-news"] });
    },
  });
};

export const useReadUserBookmarkedNews = (page: number = 1, limit: number = 20, enabled: boolean = true) => {
  const hash = ["user-bookmarked-news", page, limit];
  const { data, isPending, error, isSuccess, isFetching } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchUserBookmarkedNews(page, limit);
      return response;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on unauthorized errors
      if (error?.name === "UnauthorizedError") {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    data: data?.data || [],
    count: data?.count || 0,
    isPending,
    isFetching,
    isSuccess,
    error,
  };
};

// Unified hook that handles both regular news and bookmarks based on selectedTag
export const useReadNewsFeedUnified = (selectedTag: string) => {
  const isBookmarksTab = selectedTag === "Bookmarks";

  // Regular news feed hook
  const {
    data: newsData,
    isPending: isNewsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error: newsError,
  } = useReadInfiniteNewsFeed(selectedTag === "All" ? undefined : selectedTag);

  // Bookmarks hook
  const {
    data: bookmarkedData,
    isPending: isBookmarksPending,
    error: bookmarksError,
  } = useReadUserBookmarkedNews(1, 50, isBookmarksTab);

  // Return unified interface
  return {
    data: isBookmarksTab ? bookmarkedData : newsData,
    isPending: isBookmarksTab ? isBookmarksPending : isNewsPending,
    error: isBookmarksTab ? bookmarksError : newsError,
    // Only provide infinite scroll functionality for non-bookmark tabs
    fetchNextPage: isBookmarksTab ? undefined : fetchNextPage,
    hasNextPage: isBookmarksTab ? false : hasNextPage,
    isFetchingNextPage: isBookmarksTab ? false : isFetchingNextPage,
    isBookmarksTab,
  };
};
