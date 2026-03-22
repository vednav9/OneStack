import { useState } from "react";
import * as authService from "../services/authService";

export default function useAuth() {
    const [user, setUser] = useState(null);

    async function loginUser(data) {
        const res = await authService.login(data);

        // Later we can fetch user profile here
        setUser(res.user);
    }

    function logoutUser() {
        authService.logout();
        setUser(null);
    }

    return {
        user,
        loginUser,
        logoutUser,
    };
}
