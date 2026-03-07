import { ThumbsUp, Bookmark, Share } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  return (
    <div className="border rounded-lg p-5 bg-white hover:shadow transition">
      <Link to={`/blog/${blog.id}`}>
        <h2 className="text-lg font-semibold mb-2">{blog.title}</h2>
      </Link>

      <p className="text-gray-600 text-sm mb-3">{blog.description}</p>

      <div className="text-xs text-gray-500 mb-4">
        {blog.author} • {blog.readTime} min read
      </div>

      <div className="flex gap-4">
        <button className="flex items-center gap-1 text-sm">
          <ThumbsUp size={16} />
          {blog.likes}
        </button>

        <button>
          <Bookmark size={16} />
        </button>

        <button>
          <Share size={16} />
        </button>
      </div>
    </div>
  );
}
