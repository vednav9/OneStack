import { getUserById, updateUser, getHistory, getSavedBlogs } from "../services/userService.js";

export async function getProfile(req, res) {
    try {
        const user = await getUserById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        // Don't expose password
        const { password, ...safe } = user;
        res.json(safe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateProfile(req, res) {
    try {
        const { password, ...allowedFields } = req.body; // prevent password change here
        const updated = await updateUser(req.user.userId, allowedFields);
        const { password: _p, ...safe } = updated;
        res.json(safe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getUserHistory(req, res) {
    try {
        const history = await getHistory(req.user.userId);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getUserSaved(req, res) {
    try {
        const saved = await getSavedBlogs(req.user.userId);
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
