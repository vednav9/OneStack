import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Compass, ArrowRight } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] -z-10 animate-pulse" />

      <div className="w-full max-w-[400px] p-6 sm:p-8 animate-slide-up">
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
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
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
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link to="#" className="text-xs text-primary hover:underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>
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
            </div>

            <Button type="submit" className="w-full h-11 text-base group mt-2" isLoading={isLoading}>
              Sign In
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline underline-offset-4 transition-colors">
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}