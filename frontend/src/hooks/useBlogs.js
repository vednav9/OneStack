import { useEffect, useState, useCallback } from "react";
import * as blogService from "../services/blogService";
import * as recService from "../services/recommendationService";
import { useFeedStore } from "../store/feedStore";

/**
 * Custom hook to fetch blogs based on a type.
 * @param {'all'|'trending'|'feed'|'recommended'} type 
 */
export default function useBlogs(type = "all") {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sortMode = useFeedStore((state) => state.sortMode);

    const loadBlogs = useCallback(async () => {
        try {
            setLoading(true);
            let data;
            let blogArray = [];
            if (type === "trending") {
                data = await recService.getTrending();
                blogArray = Array.isArray(data) ? data : data?.blogs || data?.data || [];
            } else if (type === "feed") {
                data = await recService.getFeed();
                blogArray = Array.isArray(data) ? data : data?.blogs || data?.data || [];
            } else if (type === "recommended") {
                data = await recService.getRecommended();
                blogArray = Array.isArray(data) ? data : data?.blogs || data?.data || [];
            } else if (type === "all") {
                if (sortMode === "latest") {
                    data = await blogService.getBlogs();
                    blogArray = Array.isArray(data) ? data : data?.blogs || data?.data || [];
                } else {
                    // For You (Relevant): personalized feed + "might read this".
                    const [feedResult, recommendedResult] = await Promise.all([
                        recService.getFeed().catch(() => []),
                        recService.getRecommended().catch(() => []),
                    ]);
                    blogArray = [
                        ...(Array.isArray(feedResult) ? feedResult : feedResult?.blogs || []),
                        ...(Array.isArray(recommendedResult) ? recommendedResult : recommendedResult?.blogs || []),
                    ];
                }
            } else {
                data = await blogService.getBlogs();
                blogArray = Array.isArray(data) ? data : data?.blogs || data?.data || [];
            }
            
            if (type === "all" && sortMode === "relevant" && blogArray.length === 0) {
                data = await blogService.getBlogs();
                blogArray = Array.isArray(data) ? data : data?.blogs || data?.data || [];
            }

            if (type === "all") {
                const seen = new Set();
                blogArray = blogArray.filter((blog) => {
                    const key = blog?.id ?? blog?.sourceURL ?? JSON.stringify(blog);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
            }

            if (sortMode === "latest" && type === "all") {
                blogArray = [...blogArray].sort((a, b) => {
                    const aTime = new Date(a?.publishedAt || 0).getTime();
                    const bTime = new Date(b?.publishedAt || 0).getTime();
                    return bTime - aTime;
                });
            }
            
            setBlogs(blogArray);
            setError(null);
        } catch (err) {
            console.error(`Failed to fetch ${type} blogs`, err);
            setError(`Failed to load ${type} blogs. Please try again later.`);
        } finally {
            setLoading(false);
        }
    }, [type, sortMode]);

    useEffect(() => {
        loadBlogs();
    }, [loadBlogs]);

    async function handleSave(id) {
        try {
            await blogService.saveBlog(id);
        } catch (err) {
            console.error("Failed to save blog", err);
        }
    }

    async function handleLike(id) {
        try {
             await blogService.likeBlog(id);
        } catch (err) {
             console.error("Failed to like blog", err);
        }
    }

    return {
        blogs,
        loading,
        error,
        refresh: loadBlogs,
        handleSave,
        handleLike,
    };
}