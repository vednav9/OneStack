import { useEffect, useState, useCallback } from "react";
import * as blogService from "../services/blogService";
import * as recService from "../services/recommendationService";

/**
 * Custom hook to fetch blogs based on a type.
 * @param {'all'|'trending'|'feed'|'recommended'} type 
 */
export default function useBlogs(type = "all") {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBlogs = useCallback(async () => {
        try {
            setLoading(true);
            let data;
            if (type === "trending") {
                data = await recService.getTrending();
            } else if (type === "feed") {
                data = await recService.getFeed();
            } else if (type === "recommended") {
                data = await recService.getRecommended();
            } else {
                data = await blogService.getBlogs();
            }
            
            // Normalize backend response if they wrap array in an object
            const blogArray = Array.isArray(data) ? data : data?.blogs || data?.data || [];
            
            setBlogs(blogArray);
            setError(null);
        } catch (err) {
            console.error(`Failed to fetch ${type} blogs`, err);
            setError(`Failed to load ${type} blogs. Please try again later.`);
        } finally {
            setLoading(false);
        }
    }, [type]);

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