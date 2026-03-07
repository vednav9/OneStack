import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Tag from "../ui/Tag";
import BlogActions from "./BlogActions";

export default function BlogCard({ blog }) {
  return (
    <Card>
      <Link to={`/blog/${blog.id}`}>
        <h2 className="text-lg font-semibold mb-2 hover:underline">
          {blog.title}
        </h2>
      </Link>

      <p className="text-gray-600 text-sm mb-3">{blog.description}</p>

      <div className="text-xs text-gray-500">
        {blog.author} • {blog.readTime} min read
      </div>

      <BlogActions blogId={blog.id} likes={blog.likes} />

      <div className="flex gap-2 mb-3 mt-2">
        {blog.tags?.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </Card>
  );
}
