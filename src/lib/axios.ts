import axios, { AxiosRequestConfig } from "axios";
import { env } from "./env";

const GOOGLE_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const defaultRequest = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 20000,
});

const googleRequest = axios.create({
  baseURL: GOOGLE_URL,
  timeout: 20000,
});

export const getRequest = async (path = "", options: AxiosRequestConfig = {}) => {
  return defaultRequest.get(path, options);
};

export const getGoogleRequest = async (path = "", options: AxiosRequestConfig = {}) => {
  return googleRequest.get(path, options);
};

export const getAllRequest = async (paths: string[] = []) => {
  const requests = paths.map((path) => defaultRequest.get(path));
  try {
    const responses = await Promise.all(requests);
    return responses.map((response) => response.data);
  } catch (error) {
    throw error;
  }
};
