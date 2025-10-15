import axios from "axios";
import { handleTokenExpiration } from "../utils/authUtils";

const BASE_URL = import.meta.env.VITE_REACT_APP_BASE_URL as string;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: {
  resolve: (token?: string) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token || undefined);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error?.config;
    if (!originalRequest) return Promise.reject(error);

    const url = originalRequest.url ?? "";

    // Skip token handling for revoke/signout endpoints (adjusted to your API)
    if (url.includes("/Auth/revoke") || url.includes("/Auth/signout")) {
      return Promise.reject(error);
    }

    // If not 401, already retried, or this is the refresh endpoint, handle/stop
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      url.includes("/Auth/refresh")
    ) {
      // If refresh itself returned 401, force logout/expiration handling
      if (error.response?.status === 401 && url.includes("/Auth/refresh")) {
        handleTokenExpiration();
      }
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Start refresh flow
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        handleTokenExpiration();
        throw new Error("No refresh token available");
      }

      // Call refresh endpoint (adjusted to your API path)
      const response = await axios.post(
        `${BASE_URL}/Auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );

      // Support common token field names
      const newAccessToken =
        response.data?.accessToken ??
        response.data?.token ??
        response.data?.access_token;
      const newRefreshToken =
        response.data?.refreshToken ?? response.data?.refresh_token;

      if (!newAccessToken || !newRefreshToken) {
        throw new Error("Invalid token response format");
      }

      // Save new tokens
      localStorage.setItem("token", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Update default header for future requests
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${newAccessToken}`;

      // Resolve queued requests
      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry original request with new token
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      handleTokenExpiration();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
