import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Compass } from "lucide-react";

/**
 * This page is the redirect target from the backend Google OAuth callback.
 * URL: /auth?token=<accessToken>
 * It picks up the token, saves it, then fetches the user and redirects home.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      loginWithGoogle(token).then(() => navigate("/", { replace: true }));
    } else {
      // No token => something went wrong, go to login
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background animate-fade-in">
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg animate-pulse">
        <Compass className="h-7 w-7 text-primary-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">Signing you in with Google…</p>
    </div>
  );
}
