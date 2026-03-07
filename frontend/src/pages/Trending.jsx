import BlogFeed from "../components/blog/BlogFeed";
import useBlogs from "../hooks/useBlogs";

export default function Trending() {
  const { blogs } = useBlogs("trending");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Trending Blogs</h1>

      <BlogFeed blogs={blogs} />
    </div>
  );
}
