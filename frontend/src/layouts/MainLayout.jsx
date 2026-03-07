import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import LeftSidebar from "../components/sidebar/LeftSidebar";
import RightSidebar from "../components/sidebar/RightSidebar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <aside className="w-64 border-r bg-white">
          <LeftSidebar />
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <aside className="w-80 border-l bg-white">
          <RightSidebar />
        </aside>
      </div>
      <Footer />
    </div>
  );
}
