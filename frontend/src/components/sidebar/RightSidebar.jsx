export default function RightSidebar() {
  const topics = [
    "AI",
    "Web Development",
    "Startups",
    "Programming",
    "Machine Learning",
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
      </div>
    </div>
  );
}
