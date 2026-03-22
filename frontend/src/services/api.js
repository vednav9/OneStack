// Base API configuration

const BASE_URL = "http://localhost:5000/api";

// Generic API request function
export async function apiRequest(endpoint, options = {}) {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            ...options,
        });

        return await res.json();
    } catch (err) {
        console.error("API Error:", err);
    }
}
