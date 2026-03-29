import { apiRequest } from "./api";

// Get all blogs
export function getBlogs() {
    return apiRequest("/blogs");
}

// Get single blog
export function getBlog(id) {
    return apiRequest(`/blogs/${id}`);
}

// Toggle save — POST to save, DELETE to unsave
export function saveBlog(id) {
    return apiRequest(`/blogs/${id}/save`, { method: "POST" });
}
export function unsaveBlog(id) {
    return apiRequest(`/blogs/${id}/save`, { method: "DELETE" });
}

// Toggle like — POST to like, DELETE to unlike
export function likeBlog(id) {
    return apiRequest(`/blogs/${id}/like`, { method: "POST" });
}
export function unlikeBlog(id) {
    return apiRequest(`/blogs/${id}/like`, { method: "DELETE" });
}

// Add to history
export function readBlog(id) {
    return apiRequest(`/blogs/${id}/read`, { method: "POST" });
}
