import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { loginAdmin } = useAuthStore();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginAdmin(formData.username, formData.password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Admin login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] -z-10 animate-pulse" />

      <div className="w-full max-w-[420px] p-6 sm:p-8 animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gradient-red">OneStack</span>
        </Link>

        <div className="bg-glass border rounded-2xl p-8 shadow-xl backdrop-blur-2xl">
          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter admin credentials to access the dashboard.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive mb-6 text-center rounded-lg p-3 text-sm flex items-center justify-center gap-2 animate-fade-in">
              <span className="w-1 h-1 rounded-full bg-destructive" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="admin-username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Username
              </label>
              <Input
                id="admin-username"
                name="username"
                type="text"
                placeholder="Admin username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
                className="h-11 bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Password
              </label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                placeholder="Admin password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="off"
                className="h-11 bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-primary/30"
              />
            </div>

            <Button type="submit" className="w-full h-11" isLoading={isLoading}>
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
