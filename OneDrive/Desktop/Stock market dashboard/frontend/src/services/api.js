import axios from "axios";
import API_BASE_URL from "../config"; // make sure this exists

const API = axios.create({ baseURL: `${API_BASE_URL}/api` });

API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return req;
});

export default API;