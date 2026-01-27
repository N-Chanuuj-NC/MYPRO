import axios from "axios";

// CRA: set REACT_APP_API_BASE_URL (e.g. http://localhost:5000) or rely on proxy.
// We append "/api" here so services can call api.get("/trainer/..."), etc.
const api = axios.create({
  baseURL: (process.env.REACT_APP_API_BASE_URL || "") + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
