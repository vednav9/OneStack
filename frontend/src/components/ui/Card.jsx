export default function Card({ children }) {
  return (
    <div className="bg-white border rounded-lg p-5 hover:shadow-sm transition">
      {children}
    </div>
  );
}
