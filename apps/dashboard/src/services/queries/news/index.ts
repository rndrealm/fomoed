import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CryptopanicPost, NewsRowInsert } from "./types";
import { fetchPopularNews } from "./actions";

// export const useFetchTokenNews = (token?: string) => {
//   const hash = ["news", token];
//   const { data, isPending, error, isSuccess } = useQuery({
//     queryKey: hash,
//     queryFn: async () => {
//       const response = await api.get({
//         url: `/api/news`,
//       });
//       return response.data as CryptopanicPost[];
//     },
//     // enabled: !!token,
//   });
//   return {
//     data,
//     isPending,
//     isSuccess,
//     error,
//   };
// };

export const useReadTokenNews = (token: string = "BTC") => {
  const hash = ["token-news", token];
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await fetchPopularNews(token);
      return response as NewsRowInsert[];
    },
  });
  return {
    data,
    isPending,
    isSuccess,
    error,
  };
};
