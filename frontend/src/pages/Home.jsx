import SearchBar from "../components/search/SearchBar";
import Filters from "../components/search/Filters";
import BlogCard from "../components/blog/BlogCard";
import BlogFeed from "../components/blog/BlogFeed";
import useBlogs from "../hooks/useBlogs";

export default function Home() {
  const { blogs, loadMore } = useBlogs();

  return (
    <div className="space-y-6">
      <SearchBar />

      <Filters />

      <BlogFeed
        blogs={blogs}
        loadMore={loadMore}
      />
    </div>
  );
}
