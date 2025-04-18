import axios from "axios";
import axiosInstance from "./axiosConfig";

interface Request {
  url: string;
  body?: Record<string, unknown>;
  auth?: boolean;
}

const baseURL = "/";

const del = async ({ url, body: data }: Request) => {
  return await axiosInstance.delete(url, {
    data,
  });
};

const get = async ({ url, auth = true }: Request) => {
  const ald = await (auth ? axiosInstance.get(url) : axios.get(url));
  return ald;
};

const post = async ({ url, body, auth = true }: Request) => {
  return await (auth
    ? axiosInstance.post(url, body)
    : axios.post(baseURL + url, body));
};

const patch = async ({ url, body }: Request) => {
  return await axiosInstance.patch(url, body);
};

const put = async ({ url, body }: Request) => {
  return (await axiosInstance.put(url, body)).data;
};

const api = {
  delete: del,
  get,
  patch,
  post,
  put,
};

export default api;
