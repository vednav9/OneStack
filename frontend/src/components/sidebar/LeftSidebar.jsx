import { Home, Bookmark, ThumbsUp, Clock, List } from "lucide-react";

export default function LeftSidebar() {
  const items = [
    { name: "Home", icon: Home },
    { name: "Saved", icon: Bookmark },
    { name: "Liked", icon: ThumbsUp },
    { name: "To Read", icon: Clock },
    { name: "Lists", icon: List },
  ];

  return (
    <div className="p-4 space-y-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.name}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
          >
            <Icon size={18} />
            <span>{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}
