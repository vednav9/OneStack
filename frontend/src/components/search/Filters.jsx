export default function Filters() {
  const filters = ["All", "AI", "Programming", "Startups", "Design"];

  return (
    <div className="flex gap-3 mb-6">
      {filters.map((filter) => (
        <button
          key={filter}
          className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
