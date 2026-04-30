import { apiRequest } from "./api";

export function getBlogComments(blogId) {
  return apiRequest(`/blogs/${blogId}/comments`);
}

export function createBlogComment(blogId, content) {
  return apiRequest(`/blogs/${blogId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function upvoteComment(commentId) {
  return apiRequest(`/comments/${commentId}/upvote`, { method: "POST" });
}

export function removeUpvoteComment(commentId) {
  return apiRequest(`/comments/${commentId}/upvote`, { method: "DELETE" });
}

export function downvoteComment(commentId) {
  return apiRequest(`/comments/${commentId}/downvote`, { method: "POST" });
}

export function removeDownvoteComment(commentId) {
  return apiRequest(`/comments/${commentId}/downvote`, { method: "DELETE" });
}
