import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Compass, Sparkles } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />

      <div className="w-full max-w-[440px] p-6 sm:p-8 animate-slide-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gradient-red">BlogSphere</span>
        </Link>

        {/* Form container */}
        <div className="bg-glass border rounded-2xl p-8 shadow-xl backdrop-blur-2xl">
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <span>Join the engineering community</span>
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
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
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11 bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11 bg-background/50 border-white/10 dark:border-white/5 focus-visible:ring-primary/30"
              />
              <p className="text-[11px] text-muted-foreground ml-1 mt-1">Must be at least 8 characters</p>
            </div>

            <Button type="submit" className="w-full h-11 text-base mt-4 shadow-md bg-gradient-to-r from-primary to-red-700 hover:from-primary/90 hover:to-red-700/90 border-0 text-white" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8 leading-relaxed max-w-[280px] mx-auto">
          By signing up, you agree to our <Link to="#" className="hover:underline hover:text-foreground">Terms</Link> and <Link to="#" className="hover:underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}