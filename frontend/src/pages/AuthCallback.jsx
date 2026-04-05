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
    let cancelled = false;

    async function completeOAuthLogin() {
      const hashParams = new URLSearchParams(window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "");
      const token = hashParams.get("token") || searchParams.get("token");
      const refreshToken = hashParams.get("refreshToken") || searchParams.get("refreshToken");

      if (!token) {
        if (!cancelled) navigate("/login?error=oauth_missing_token", { replace: true });
        return;
      }

      try {
        await loginWithGoogle(token, refreshToken);
        if (!cancelled) navigate("/", { replace: true });
      } catch {
        if (!cancelled) navigate("/login?error=oauth_failed", { replace: true });
      }
    }

    completeOAuthLogin();

    return () => {
      cancelled = true;
    };
  }, [searchParams, loginWithGoogle, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background animate-fade-in">
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg animate-pulse">
        <Compass className="h-7 w-7 text-primary-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">Signing you in with Google…</p>
    </div>
  );
}
