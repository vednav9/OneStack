import { apiRequest } from "./api";

export function getLists() {
    return apiRequest("/lists");
}

export function createList(name) {
    return apiRequest("/lists", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}

export function deleteList(id) {
    return apiRequest(`/lists/${id}`, { method: "DELETE" });
}

export function addBlogToList(listId, blogId) {
    return apiRequest(`/lists/${listId}/blogs`, {
        method: "POST",
        body: JSON.stringify({ blogId }),
    });
}

export function removeBlogFromList(listId, blogId) {
    return apiRequest(`/lists/${listId}/blogs/${blogId}`, { method: "DELETE" });
}
