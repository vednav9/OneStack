import SearchBar from "../components/search/SearchBar";
import Filters from "../components/search/Filters";
import BlogCard from "../components/blog/BlogCard";

const dummyBlogs = [
  {
    id: 1,
    title: "Understanding React Server Components",
    description: "A deep dive into RSC architecture.",
    author: "Dan Abramov",
    readTime: 5,
    likes: 120,
  },
  {
    id: 2,
    title: "How AI is Changing Software Development",
    description: "Exploring AI tools for developers.",
    author: "OpenAI",
    readTime: 6,
    likes: 95,
  },
];

export default function Home() {
  return (
    <div>
      <SearchBar />

      <Filters />

      <div className="space-y-4">
        {dummyBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}
