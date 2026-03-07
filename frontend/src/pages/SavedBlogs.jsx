import useBlogStore from "../store/blogStore";
import BlogCard from "../components/blog/BlogCard";

export default function SavedBlogs() {
  const { savedBlogs } = useBlogStore();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Saved Blogs</h1>

      {savedBlogs.length === 0 && <p>No saved blogs yet.</p>}
    </div>
  );
}
