import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL = "/";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
    "API-KEY": process.env.NEXT_PUBLIC_SOCKET_KEY,
  },
});

const onRequest = async (
  request: AxiosRequestConfig
): Promise<InternalAxiosRequestConfig<unknown>> => {
  return request as InternalAxiosRequestConfig<unknown>;
};

const onRequestError = async (error: AxiosError): Promise<AxiosError> => {
  return await Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response.data ?? response;
};

const onResponseError = async (error: AxiosError) => {
  return await Promise.reject(error?.response?.data || error.message);
};

axiosInstance.interceptors.request.use(onRequest, onRequestError);
axiosInstance.interceptors.response.use(onResponse, onResponseError);

export default axiosInstance;
