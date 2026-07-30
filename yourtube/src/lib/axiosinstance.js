import axios from "axios";

console.log("BASE URL =", process.env.NEXT_PUBLIC_BACKEND_URL);

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 8000,
});

export default axiosInstance;