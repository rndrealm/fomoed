import { useMutation } from "@tanstack/react-query";
import { uploadProfileImage } from "./actions";
import api from "@/services/api";

const BASE_URL = "https://fomoed-data-ingestion-509111531565.us-central1.run.app/api/v1";
// const BASE_URL = "http://localhost:3000/api/v1";

// Environment determination for Supabase auth
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const getAuthHeaders = (auth_token?: string) => ({
  ...(auth_token ? { Authorization: `Bearer ${auth_token}` } : {}),
  "x-auth-env": IS_PRODUCTION ? "production" : "development",
  "x-db-origin": SUPABASE_URL,
});

export const useUploadImage = (auth_token?: string) => {
  return useMutation({
    mutationFn: (file: File) => uploadProfileImage(file, getAuthHeaders(auth_token)),
  });
};

export const useJoinWaitlist = (authToken?: string) => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.gemachPost({
        url: `${BASE_URL}/waitlist/join`,
        body: data,
        auth: false,
        headers: getAuthHeaders(authToken),
      });

      return res?.data;
    },
  });
};
