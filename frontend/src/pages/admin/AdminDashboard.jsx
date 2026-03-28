import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Users, FileText, Activity, Server, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuthStore();

  // Basic role check (mocked for now)
  if (!user || user.role !== "ADMIN") {
    // In a real app we might redirect to / if not admin
    // return <Navigate to="/" />;
  }

  const stats = [
    { title: "Total Users", value: "12,345", icon: Users, change: "+12%" },
    { title: "Blogs Indexed", value: "45,678", icon: FileText, change: "+5.4%" },
    { title: "Active Readers", value: "8,901", icon: Activity, change: "+2.1%" },
    { title: "Sync Errors", value: "3", icon: AlertTriangle, change: "-1", critical: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="border-b pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">System Dashboard</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              All synchronization workers operational.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              System Healthy
            </span>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-semibold">
              Admin Access
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`hover:border-primary/50 transition-colors ${stat.critical ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.critical ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 font-medium ${stat.change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple logs / activity section */}
      <h2 className="text-xl font-bold mt-12 mb-6">Recent Server Activity</h2>
      <div className="border rounded-xl bg-card overflow-hidden">
        <ul className="divide-y text-sm">
          {[
            { msg: "Ingested 45 new articles from Netflix Tech Blog", time: "10 mins ago", type: "success" },
            { msg: "Redis cache cleared manually", time: "1 hour ago", type: "info" },
            { msg: "Failed to fetch from Uber RSS feed (Timeout)", time: "3 hours ago", type: "error" },
            { msg: "Database vacumming completed successfully", time: "12 hours ago", type: "success" },
          ].map((log, i) => (
            <li key={i} className="flex gap-4 p-4 hover:bg-secondary/50 transition-colors">
              <span className={`shrink-0 w-2 h-2 rounded-full mt-2
                ${log.type === "success" ? "bg-green-500" : 
                  log.type === "error" ? "bg-destructive animate-pulse" : "bg-primary"}`} 
              />
              <div className="flex-1">
                <p className="font-medium">{log.msg}</p>
                <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
