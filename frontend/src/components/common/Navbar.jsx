import { Search, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "./Container";

export default function Navbar() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="text-xl font-bold">
            BlogSphere
          </Link>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded hover:bg-gray-100">
              <Search size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Bell size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <User size={18} />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
