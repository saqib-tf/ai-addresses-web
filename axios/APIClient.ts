import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { ErrorMessageDto } from "@/models/ErrorMessageDto";

const apiBaseUrl = process.env.NEXT_PUBLIC_WEB_API_BASE_URL;

// console.log("id token in APIClient:", session?.id_token);

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Authorization header if id_token is available
    // if (session && session.id_token) {
    //   config.headers = config.headers || {};
    // config.headers["Authorization"] = `Bearer session.id_token`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    handleError(error);
    return Promise.reject(error);
  }
);

function handleError(error: AxiosError) {
  // Centralized error handling
  if (error.response) {
    // Server responded with a status other than 2xx
    const data = error.response.data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const errMsg = data as ErrorMessageDto;
      console.error(
        "API Error:",
        error.response.status,
        errMsg.message,
        errMsg.detail,
        errMsg.errors
      );
    } else {
      console.error("API Error:", error.response.status, data);
    }
  } else if (error.request) {
    // No response received
    console.error("No response from API:", error.request);
  } else {
    // Something else happened
    console.error("API Error:", error.message);
  }
}

export default apiClient;
