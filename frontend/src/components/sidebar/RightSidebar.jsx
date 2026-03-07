export default function RightSidebar() {
  const topics = [
    "AI",
    "Web Development",
    "Startups",
    "Blockchain",
    "Programming",
  ];

  return (
    <div className="p-5">
      <h3 className="font-semibold mb-3">Suggested Topics</h3>

      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
