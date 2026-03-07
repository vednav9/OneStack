import { ThumbsUp, Bookmark, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";

export default function BlogCard({ blog }) {

  return (
    <Card>

      <Link to={`/blog/${blog.id}`}>
        <h2 className="text-lg font-semibold mb-2 hover:underline">
          {blog.title}
        </h2>
      </Link>

      <p className="text-gray-600 text-sm mb-3">
        {blog.description}
      </p>

      <div className="text-xs text-gray-500 mb-4">
        {blog.author} • {blog.readTime} min read
      </div>

      <div className="flex items-center gap-4">

        <button className="flex items-center gap-1 text-sm hover:text-green-500">
          <ThumbsUp size={16} />
          {blog.likes}
        </button>

        <button className="hover:text-blue-500">
          <Bookmark size={16} />
        </button>

        <button className="hover:text-green-500">
          <Share2 size={16} />
        </button>

      </div>

    </Card>
  );
}