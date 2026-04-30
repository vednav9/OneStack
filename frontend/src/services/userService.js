const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  return data?.message || data?.error || "Something went wrong";
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${BASE_URL}/user/profile/photo`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  return response.json();
}
