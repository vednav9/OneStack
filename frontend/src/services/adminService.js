const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const ADMIN_TOKEN_KEY = "adminToken";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function loginAdmin(username, password) {
  const response = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Admin login failed");
  }

  return response.json();
}

export async function verifyAdminToken(token) {
  const response = await fetch(`${BASE_URL}/admin/verify`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Unauthorized");
  }

  return response.json();
}
