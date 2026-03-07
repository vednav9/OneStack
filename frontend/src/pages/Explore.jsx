import BlogFeed from "../components/blog/BlogFeed";
import useBlogs from "../hooks/useBlogs";

export default function Explore() {

  const { blogs } = useBlogs();

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        Explore Blogs
      </h1>

      <BlogFeed blogs={blogs} />

    </div>
  );
}