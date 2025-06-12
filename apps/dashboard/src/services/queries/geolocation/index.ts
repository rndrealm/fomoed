import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { UserGeoLocation } from "./types";

export const useFetchUserLocation = () => {
  const hash = ["user-geolocation"];
  const response = useQuery<UserGeoLocation>({
    queryKey: hash,
    queryFn: async () => {
      const res = await api.get({
        url: "https://ipinfo.io/json",
      });
      return res;
    },
  });
  return response;
};
