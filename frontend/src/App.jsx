import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BlogPage from "./pages/BlogPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";
import Trending from "./pages/Trending";
import SavedBlogs from "./pages/SavedBlogs";
import History from "./pages/History";
import Lists from "./pages/Lists";
import Profile from "./pages/Profile";
import TopicPage from "./pages/TopicPage";
import SearchPage from "./pages/SearchPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main app with layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:id" element={<BlogPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/saved" element={<SavedBlogs />} />
          <Route path="/history" element={<History />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/topic/:topic" element={<TopicPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}