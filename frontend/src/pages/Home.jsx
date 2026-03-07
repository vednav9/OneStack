import SearchBar from "../components/search/SearchBar";
import Filters from "../components/search/Filters";
import BlogCard from "../components/blog/BlogCard";
import useBlogs from "../hooks/useBlogs";

export default function Home() {
  const { blogs } = useBlogs();

  return (
    <div className="space-y-6">
      <SearchBar />

      <Filters />

      <div className="space-y-4">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}
