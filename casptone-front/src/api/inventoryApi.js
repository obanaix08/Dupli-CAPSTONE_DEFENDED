import axios from "axios";

const API_URL = "http://localhost:8000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function getAdminOverview() {
  const res = await axios.get(`${API_URL}/admin/overview`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function getForecast(params = {}) {
  const res = await axios.get(`${API_URL}/forecast`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
}

export function downloadStockCsv() {
  window.open(`${API_URL}/reports/stock.csv`, "_blank");
}

export function downloadUsageCsv(days = 90) {
  const url = `${API_URL}/reports/usage.csv?days=${encodeURIComponent(days)}`;
  window.open(url, "_blank");
}

export function downloadReplenishmentCsv() {
  window.open(`${API_URL}/reports/replenishment.csv`, "_blank");
}

