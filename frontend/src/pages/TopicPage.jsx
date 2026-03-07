import { useParams } from "react-router-dom";
import BlogFeed from "../components/blog/BlogFeed";
import useBlogs from "../hooks/useBlogs";

export default function TopicPage() {
  const { topic } = useParams();
  const { blogs } = useBlogs(topic);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{topic} Blogs</h1>

      <BlogFeed blogs={blogs} />
    </div>
  );
}
