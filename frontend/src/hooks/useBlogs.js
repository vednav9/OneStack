import { useEffect, useState } from "react";
import * as blogService from "../services/blogService";

export default function useBlogs() {
    const [blogs, setBlogs] = useState([]);

    async function loadBlogs() {
        const data = await blogService.getBlogs();
        setBlogs(data);
    }

    useEffect(() => {
        loadBlogs();
    }, []);

    async function handleSave(id) {
        await blogService.saveBlog(id);
        alert("Saved!");
    }

    async function handleLike(id) {
        await blogService.likeBlog(id);
        alert("Liked!");
    }

    return {
        blogs,
        handleSave,
        handleLike,
    };
}