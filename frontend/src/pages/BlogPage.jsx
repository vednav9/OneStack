import { useParams } from "react-router-dom";

export default function BlogPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Blog Title {id}</h1>

      <div className="border rounded-lg overflow-hidden">
        <iframe src="https://example.com" className="w-full h-[800px]" />
      </div>
    </div>
  );
}
