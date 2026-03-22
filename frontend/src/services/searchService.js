import { apiRequest } from "./api";

// Search blogs
export function searchBlogs(query) {
    return apiRequest(`/search?q=${query}`);
}
