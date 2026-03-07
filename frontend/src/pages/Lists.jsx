export default function Lists() {
  const lists = [
    { id: 1, name: "AI Blogs" },
    { id: 2, name: "Startup Ideas" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Lists</h1>

      <div className="grid grid-cols-2 gap-4">
        {lists.map((list) => (
          <div key={list.id} className="border p-4 rounded hover:shadow">
            {list.name}
          </div>
        ))}
      </div>
    </div>
  );
}
