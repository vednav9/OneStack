import { apiRequest } from "./api";

// Get all blogs
export function getBlogs() {
    return apiRequest("/blogs");
}

// Get single blog
export function getBlog(id) {
    return apiRequest(`/blogs/${id}`);
}

export function getBlogSummary(id) {
    return apiRequest(`/blogs/${id}/summary`);
}

export function getBlogEmbedStatus(id) {
    return apiRequest(`/blogs/${id}/embed-status`);
}

// Fetch fresh server-side rendered content (proxy — avoids iframe blocking)
export function getBlogContent(id) {
    return apiRequest(`/blogs/${id}/content`);
}

// Toggle save — POST to save, DELETE to unsave
export function saveBlog(id) {
    return apiRequest(`/blogs/${id}/save`, { method: "POST" });
}
export function unsaveBlog(id) {
    return apiRequest(`/blogs/${id}/save`, { method: "DELETE" });
}

// Toggle upvote/downvote
export function upvoteBlog(id) {
    return apiRequest(`/blogs/${id}/upvote`, { method: "POST" });
}
export function removeUpvoteBlog(id) {
    return apiRequest(`/blogs/${id}/upvote`, { method: "DELETE" });
}
export function downvoteBlog(id) {
    return apiRequest(`/blogs/${id}/downvote`, { method: "POST" });
}
export function removeDownvoteBlog(id) {
    return apiRequest(`/blogs/${id}/downvote`, { method: "DELETE" });
}

// Delete blog (admin only)
export function deleteBlog(id) {
    return apiRequest(`/blogs/${id}`, { method: "DELETE" });
}

// Add to history
export function readBlog(id) {
    return apiRequest(`/blogs/${id}/read`, { method: "POST" });
}
