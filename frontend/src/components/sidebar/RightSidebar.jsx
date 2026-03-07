import SuggestedBlogs from "../blog/SuggestedBlogs";

export default function RightSidebar() {
  const topics = [
    "AI",
    "Web Development",
    "Startups",
    "Programming",
    "Machine Learning",
  ];
  const blogs = [
    {
      id: 10,
      title: "Future of AI Development",
      description: "AI will change coding",
      author: "OpenAI",
      readTime: 4,
      likes: 50
    }
  ];

  return (
    <div className="p-5 space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Suggested Topics</h3>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              {topic}
            </span>
          ))}
        </div>
        <SuggestedBlogs blogs={blogs} />
      </div>
    </div>
  );
}
