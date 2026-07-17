import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { env } from '@/lib/env';
import { AppError } from '@/lib/error';

const BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;
const GOOGLE_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

const defaultRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

const googleRequest = axios.create({
  baseURL: GOOGLE_URL,
  timeout: 20000,
});

// Response interceptors to normalize all errors into AppError
defaultRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(AppError.fromApiResponse(error));
  }
);

googleRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(AppError.fromApiResponse(error));
  }
);

export const getRequest = async (
  path = '',
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse> => {
  const response = await defaultRequest.get(path, options);
  return response;
};

export const getGoogleRequest = async (
  path = '',
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse> => {
  const response = await googleRequest.get(path, options);
  return response;
};

export const getAllRequest = async (paths: string[] = []): Promise<unknown[]> => {
  const requests = paths.map((path) => defaultRequest.get(path));

  try {
    const responses = await axios.all(requests);
    return responses.map((response) => response.data);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.fromApiResponse(error);
  }
};

export default defaultRequest;
