export default function AdminDashboard() {
  const stats = {
    users: 1200,
    blogs: 45000,
    dailyReads: 9000,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4 rounded">Users: {stats.users}</div>

        <div className="border p-4 rounded">Blogs: {stats.blogs}</div>

        <div className="border p-4 rounded">
          Daily Reads: {stats.dailyReads}
        </div>
      </div>
    </div>
  );
}
