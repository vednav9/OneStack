import { getUserById, updateUser } from "../services/userService.js";

export async function getProfiles(req, res) {
    const user = await getUserById(req.user.userId);
    res.json(user);
}

export async function updateProfiles(req, res) {
    const updated = await updateUser(req.user.userId, req.body);
    res.json(updated);
}
