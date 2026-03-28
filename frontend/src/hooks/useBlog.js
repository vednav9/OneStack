import { useEffect, useState, useCallback } from "react";
import * as blogService from "../services/blogService";

/**
 * Hook to fetch a single blog by ID.
 * @param {string|number} id
 */
export default function useBlog(id) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBlog = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await blogService.getBlog(id);
      setBlog(data);
    } catch (err) {
      console.error("Failed to fetch blog", err);
      setError(err.message || "Failed to load blog.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  return { blog, loading, error, refresh: loadBlog };
}