export default function SearchBar() {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search blogs, topics..."
        className="w-full border rounded-lg px-4 py-2 outline-none focus:ring"
      />
    </div>
  );
}
