import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BlogPage from "./pages/BlogPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Explore from "./pages/Explore";
import Trending from "./pages/Trending";
import SavedBlogs from "./pages/SavedBlogs";
import History from "./pages/History";
import Lists from "./pages/Lists";
import Profile from "./pages/Profile";
import TopicPage from "./pages/TopicPage";
import SearchPage from "./pages/SearchPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./store/authStore";

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function RequireAuth({ children }) {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
  }

  return children;
}

export default function App() {
  const { token, fetchUser, user } = useAuthStore();

  // On app boot, if a token is saved, fetch the user
  useEffect(() => {
    if (token && !user) fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Auth pages - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth" element={<AuthCallback />} />

        {/* Main app with layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:id" element={<BlogPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/saved" element={<RequireAuth><SavedBlogs /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
          <Route path="/lists" element={<RequireAuth><Lists /></RequireAuth>} />
          <Route path="/profile/:username" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/topic/:topic" element={<TopicPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}