import { apiRequest } from "./api";

// Recommended blogs
export function getRecommended() {
    return apiRequest("/recommendation/recommended");
}

// Personalized feed
export function getFeed() {
    return apiRequest("/recommendation/feed");
}

// Trending
export function getTrending() {
    return apiRequest("/recommendation/trending");
}
