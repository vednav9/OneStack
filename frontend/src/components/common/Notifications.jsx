export default function Notifications() {
  const notifications = ["New blog on AI", "New trending article"];

  return (
    <div className="absolute right-0 mt-2 bg-white border rounded shadow w-60">
      {notifications.map((n, i) => (
        <div key={i} className="p-3 border-b">
          {n}
        </div>
      ))}
    </div>
  );
}
