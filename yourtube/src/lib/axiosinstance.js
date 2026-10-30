import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
console.log("BASE URL =", baseURL);

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds for standard requests
});

// Interceptor to transform raw timeouts and network errors into clear user-friendly messages
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      error.message =
        "Request timed out. The server took too long to respond. Please make sure the backend server is running on port 5000 and MongoDB is connected.";
    } else if (error.code === "ERR_NETWORK" || !error.response) {
      error.message =
        "Network error: Unable to reach the server. Please ensure the backend is running at " +
        baseURL;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;