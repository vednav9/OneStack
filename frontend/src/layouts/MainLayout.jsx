import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import LeftSidebar from "../components/sidebar/LeftSidebar";
import RightSidebar from "../components/sidebar/RightSidebar";
import MobileSidebar from "../components/sidebar/MobileSidebar";
import Footer from "../components/common/Footer";

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar onMenuClick={() => setMobileOpen(true)} />

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content grid */}
      <div className="flex-1 w-full max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="flex gap-0 md:gap-8 lg:gap-10">

          {/* Left sidebar – hidden on mobile */}
          <aside className="hidden md:block w-[220px] lg:w-[240px] shrink-0 -ml-8 md:-ml-12 lg:-ml-14">
            <div className="sticky top-[3.6rem] h-[calc(100vh-3.6rem)] overflow-y-auto py-6 no-scrollbar border-r border-border pr-4">
              <LeftSidebar />
            </div>
          </aside>

          {/* Page content */}
          <main className="flex-1 min-w-0 py-6 lg:py-8">
            <Outlet />
          </main>

          {/* Right sidebar – lg+ only */}
          <aside className="hidden xl:block w-[300px] shrink-0">
            <div className="sticky top-[3.6rem] h-[calc(100vh-3.6rem)] overflow-y-auto py-6 no-scrollbar border-l border-border pl-6">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
