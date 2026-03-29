import { apiRequest } from "./api";

// Full-text search
export function searchBlogs(query) {
  return apiRequest(`/search?q=${encodeURIComponent(query)}`);
}

// Get blogs filtered by tag name (via search endpoint)
export function getBlogsByTag(tag) {
  return apiRequest(`/search?q=${encodeURIComponent(tag)}`);
}
