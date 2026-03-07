import { useParams } from "react-router-dom";
import BlogReader from "../components/blog/BlogReader";

export default function BlogPage() {
  const { id } = useParams();

  const blog = {
    title: "Understanding React Server Components",
    url: "https://example.com",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{blog.title}</h1>

      <BlogReader url={blog.url} />
    </div>
  );
}
