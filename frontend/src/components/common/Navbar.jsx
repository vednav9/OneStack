import { Search, Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="text-xl font-bold">BlogSphere</div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Search size={18} />
          </button>

          <button className="p-2 hover:bg-gray-100 rounded">
            <Bell size={18} />
          </button>

          <button className="p-2 hover:bg-gray-100 rounded">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
