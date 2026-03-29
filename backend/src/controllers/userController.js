import { getUserById, updateUser } from "../services/userService.js";

export async function getProfile(req, res) {
    const user = await getUserById(req.user.userId);
    res.json(user);
}

export async function updateProfile(req, res) {
    const updated = await updateUser(req.user.userId, req.body);
    res.json(updated);
}
