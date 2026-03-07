export default function BlogReader({ url }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <iframe
        src={url}
        className="w-full h-[900px]"
        loading="lazy"
      />
    </div>
  );
}