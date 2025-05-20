import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CryptopanicPost, NewsRowInsert } from "./types";
import { fetchPopularNews } from "./actions";

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

export const useReadTokenNews = (token: string = "BTC") => {
  const hash = ["token-news", token];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchPopularNews(token);
      return response as NewsRowInsert[];
    },
    refetchInterval: 1000 * 60 * 5,
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};

export const useReadSingleNewslabPost = (id: string = "") => {
  const hash = ["news-lab-post", id];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.get({
        url: `/api/newslab/single-post?id=${id}`,
        // url: `${process.env.NEXT_PUBLIC_NEWSLAB_URL}/api/newslab-posts/`,
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
