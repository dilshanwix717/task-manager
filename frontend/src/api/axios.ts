// src/api/axios.ts
import axios from "axios";
import { getAuthToken } from "@/store/useAuthStore";

// base url for REST calls. behind the nginx reverse proxy this is "/api"
// (same origin); in local dev it points straight at the backend port.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

// origin the socket connects to. socket.io appends its own /socket.io path,
// so it needs the host root, not the /api rest prefix. empty string means
// "same origin as the page", which is what we want behind the proxy.
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// pulls a human readable message out of an axios/nest error response
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    if (!error.response) return "Cannot reach the server. Is the API running?";
  }
  return "Something went wrong. Please try again.";
};

export default api;
