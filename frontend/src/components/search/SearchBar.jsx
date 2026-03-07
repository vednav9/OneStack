import { useState } from "react";

export default function SearchBar() {

  const [query, setQuery] = useState("");

  const suggestions = [
    "React",
    "AI",
    "Next.js",
    "Web Development",
    "Machine Learning"
  ];

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">

      <input
        type="text"
        placeholder="Search blogs, topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 outline-none"
      />

      {query && (
        <div className="absolute w-full bg-white border mt-1 rounded shadow">

          {filtered.map((item) => (
            <div
              key={item}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {item}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}