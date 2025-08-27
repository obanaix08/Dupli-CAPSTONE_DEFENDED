// src/api/productionApi.js
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const getAnalytics = async (filters = {}) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/productions/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filters, // ✅ send start_date, end_date, status
  });
  return response.data;
};
