export default function Profile() {
  const user = {
    name: "Vedant",
    saved: 12,
    liked: 25,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{user.name}</h1>

      <div className="space-y-2 text-gray-600">
        <p>Saved Blogs: {user.saved}</p>

        <p>Liked Blogs: {user.liked}</p>
      </div>
    </div>
  );
}
