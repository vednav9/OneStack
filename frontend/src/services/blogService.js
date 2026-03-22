import { apiRequest } from "./api";

// Get all blogs
export function getBlogs() {
    return apiRequest("/blogs");
}

// Get single blog
export function getBlog(id) {
    return apiRequest(`/blogs/${id}`);
}

// Save blog
export function saveBlog(id) {
    return apiRequest(`/blogs/${id}/save`, {
        method: "POST",
    });
}

// Like blog
export function likeBlog(id) {
    return apiRequest(`/blogs/${id}/like`, {
        method: "POST",
    });
}

// Add to history
export function readBlog(id) {
    return apiRequest(`/blogs/${id}/read`, {
        method: "POST",
    });
}
