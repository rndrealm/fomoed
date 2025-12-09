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
  const errorData = error?.response?.data;

  // If error data is an object, convert to Error with message
  if (errorData && typeof errorData === 'object') {
    const message =
      (errorData as any).error ||
      (errorData as any).message ||
      (errorData as any).msg ||
      error.message ||
      'An error occurred';
    return await Promise.reject(new Error(message));
  }

  // If error data is a string, convert to Error
  if (errorData && typeof errorData === 'string') {
    return await Promise.reject(new Error(errorData));
  }

  // Fallback to error message
  return await Promise.reject(new Error(error.message || 'Network error'));
};

axiosInstance.interceptors.request.use(onRequest, onRequestError);
axiosInstance.interceptors.response.use(onResponse, onResponseError);

export default axiosInstance;
