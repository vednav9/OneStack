import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Loader2, Users, FileText, Activity, Server, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token, fetchUser } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    if (!user) {
      fetchUser();
      return;
    }

    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [token, user, fetchUser, navigate, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.get("/admin/dashboard")
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAdmin]);

  if (!token || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Verifying admin access...
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  if (!isAdmin) return null;

  const stats = dashboard?.stats || [];
  const activity = dashboard?.activity || [];
  const systemHealthy = dashboard?.system?.healthy ?? true;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="border-b pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">System Dashboard</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              {systemHealthy ? "All synchronization workers operational." : "Some workers need attention."}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${
              systemHealthy
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${
                systemHealthy ? "bg-green-500" : "bg-amber-500"
              }`} />
              {systemHealthy ? "System Healthy" : "Attention Needed"}
            </span>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-semibold">
              Admin Access
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const change = String(stat.change || "0%");
          const isPositive = change.startsWith("+");
          const Icon = stat.key === "totalUsers"
            ? Users
            : stat.key === "blogsIndexed"
            ? FileText
            : stat.key === "activeReaders"
            ? Activity
            : AlertTriangle;

          return (
            <Card
              key={stat.key}
              className={`hover:border-primary/50 transition-colors ${stat.critical ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10" : ""}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.critical ? "text-red-500" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value ?? 0}</div>
                <p className={`text-xs mt-1 font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {change} from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Simple logs / activity section */}
      <h2 className="text-xl font-bold mt-12 mb-6">Recent Server Activity</h2>
      <div className="border rounded-xl bg-card overflow-hidden">
        {activity.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No recent activity yet.</div>
        ) : (
          <ul className="divide-y text-sm">
            {activity.map((log) => (
              <li key={log.id} className="flex gap-4 p-4 hover:bg-secondary/50 transition-colors">
                <span className={`shrink-0 w-2 h-2 rounded-full mt-2
                  ${log.type === "success" ? "bg-green-500" : 
                    log.type === "error" ? "bg-destructive animate-pulse" : "bg-primary"}`} 
                />
                <div className="flex-1">
                  <p className="font-medium">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(log.timestamp, "relative")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
