import { useEffect, useState, useCallback } from "react";
import * as blogService from "../services/blogService";

export default function useBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBlogs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await blogService.getBlogs();
            setBlogs(data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch blogs", err);
            setError("Failed to load blogs. Please try again later.");
            // Fallback for demo if API fails? No, let's show error state
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        loadBlogs();
    }, [loadBlogs]);

    async function handleSave(id) {
        try {
            await blogService.saveBlog(id);
            // Optimistic update could go here
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