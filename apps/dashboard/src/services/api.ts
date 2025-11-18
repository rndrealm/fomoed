import axios, { AxiosHeaders, AxiosRequestHeaders } from "axios";
import axiosInstance from "./axiosConfig";

interface Request {
  url: string;
  body?: Record<string, unknown> | unknown;
  auth?: boolean;
  headers?: any;
}

const baseURL = "/";

const del = async ({ url, body: data }: Request) => {
  return await axiosInstance.delete(url, {
    data,
  });
};

const get = async ({ url, auth = true, headers }: Request) => {
  const ald = await (auth ? axiosInstance.get(url) : axios.get(url, { headers }));
  return ald as any;
};

async function post<ResT = any>({ url, body, auth = true }: Request): Promise<ResT> {
  return await (auth ? axiosInstance.post(url, body) : axios.post(baseURL + url, body));
}

async function gemachPost<ResT = any>({ url, body, auth = true, headers }: Request): Promise<ResT> {
  return await (auth ? axiosInstance.post(url, body) : axios.post(url, body, { headers }));
}

async function gemachPut<ResT = any>({ url, body, auth = true, headers }: Request): Promise<ResT> {
  return await (auth ? axiosInstance.put(url, body) : axios.put(url, body, { headers }));
}

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
  gemachPost,
  gemachPut,
};

export default api;
