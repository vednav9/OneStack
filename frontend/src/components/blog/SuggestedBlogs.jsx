import BlogCard from "./BlogCard";

export default function SuggestedBlogs({ blogs }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Similar Blogs</h3>

      {blogs.slice(0, 3).map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}