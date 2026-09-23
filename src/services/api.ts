import axios, { AxiosError, type AxiosInstance } from "axios";

export const API_BASE_URL = "https://dummyjson.com";

export interface AppError {
  message: string;
  status?: number;
}

// Single shared Axios instance for the whole app (Rule R1).
// Every API module must import this file instead of creating its own client.
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "accessToken";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

// Request interceptor: attaches the login token to every request.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: centralizes error handling in one place.
// It normalizes any failure into an AppError so UI code deals with one shape.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    const message =
      error.response?.data?.message ??
      (status === 0 || !status ? "Network error. Check your connection." : `Request failed (${status}).`);
    const appError: AppError = { message, status };
    return Promise.reject(appError);
  },
);

export default api;
