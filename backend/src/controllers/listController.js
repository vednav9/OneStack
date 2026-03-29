import {
    getUserLists,
    createList,
    deleteList,
    addBlogToList,
    removeBlogFromList,
} from "../services/listService.js";

export async function getUserListsController(req, res) {
    try {
        const lists = await getUserLists(req.user.userId);
        res.json(lists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function createUserList(req, res) {
    try {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: "List name is required" });
        const list = await createList(req.user.userId, name.trim());
        res.status(201).json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteUserList(req, res) {
    try {
        await deleteList(req.params.id, req.user.userId);
        res.json({ message: "List deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function addBlogToListController(req, res) {
    try {
        const { blogId } = req.body;
        if (!blogId) return res.status(400).json({ error: "blogId is required" });
        const entry = await addBlogToList(req.params.id, blogId);
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function removeBlogFromListController(req, res) {
    try {
        await removeBlogFromList(req.params.id, req.params.blogId);
        res.json({ message: "Blog removed from list" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
