// src/utils/axios/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const nonAuthenticatedEndpoints = [
      "/auth/login",
      "/auth/send-code",
    ];
    if (nonAuthenticatedEndpoints.includes(config.url)) return config;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: auto-logout on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && err?.response?.status === 401) {
      localStorage.removeItem("token");
      // Fire a custom event so our AuthProvider can react
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
