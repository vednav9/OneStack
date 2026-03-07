import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import BlogCard from "./BlogCard";

export default function BlogFeed({ blogs, loadMore }) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && typeof loadMore === "function") loadMore();
  }, [inView, loadMore]);

  return (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}

      <div ref={ref} className="h-10" />
    </div>
  );
}