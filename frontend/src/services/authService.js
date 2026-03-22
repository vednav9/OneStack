import { apiRequest } from "./api";

// Register user
export function register(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

// Login user
export async function login(data) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });

  // Save token in localStorage
  localStorage.setItem("token", res.accessToken);

  return res;
}

// Logout
export function logout() {
  localStorage.removeItem("token");
}