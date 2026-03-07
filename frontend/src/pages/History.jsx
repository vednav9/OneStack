import BlogCard from "../components/blog/BlogCard";

export default function History() {
  const history = [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reading History</h1>

      {history.length === 0 && <p>No reading history yet.</p>}
    </div>
  );
}
