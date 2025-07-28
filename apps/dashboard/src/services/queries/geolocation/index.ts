import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { UserGeoLocation } from "./types";

const CACHE_KEY = "user-geolocation-cache";
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

export const useFetchUserLocation = () => {
  const hash = ["user-geolocation"];
  const response = useQuery<UserGeoLocation>({
    queryKey: hash,
    queryFn: async () => {
      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;

        if (!isExpired) {
          return data; // Return cached data
        }
      }

      // Fetch fresh data
      const res = await api.get({ url: "https://ipinfo.io/json" });

      // Store in localStorage
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: res, timestamp: Date.now() }));

      return res;
    },
    staleTime: Infinity,
  });
  return response;
};
