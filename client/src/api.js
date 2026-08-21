import axios from "axios";

export const API_URL = "https://ganesh-expense-tracker.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL
});

export function authConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}
