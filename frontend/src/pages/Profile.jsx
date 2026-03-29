import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Settings, Bookmark, ThumbsUp, Clock, Calendar } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuthStore();

  // For now, only own profile is shown (no public profiles API yet)
  const isOwnProfile = !username || username === "me" || user?.name === username;
  const profile = isOwnProfile ? user : null;
  const displayName = profile?.name || username || "User";

  useDocumentTitle(`${displayName} | Profile`);

  const savedCount = profile?._count?.savedBlogs ?? 0;
  const likedCount = profile?._count?.likedBlogs ?? 0;
  const historyCount = profile?._count?.readingHistory ?? 0;

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative mb-16 border" />

      {/* Profile Header */}
      <div className="px-4 relative -mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Avatar className="h-32 w-32 border-4 border-background bg-card shadow-lg ring-offset-background">
              <AvatarImage src={profile?.userPhoto} />
              <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{displayName}</h1>
              {profile?.email && (
                <p className="text-lg text-muted-foreground mt-1 font-medium">{profile.email}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button variant="outline" className="rounded-full shadow-sm px-6 h-11 border-border bg-card hover:bg-secondary">
                <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                Edit Profile
              </Button>
            ) : (
              <Button className="rounded-full px-8 h-11 text-base shadow-sm">Follow</Button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-8 max-w-2xl">
          {joinedDate && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Joined {joinedDate}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-8 border-b pb-8">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{savedCount}</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{likedCount}</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Liked</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{historyCount}</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Read</span>
          </div>
        </div>
      </div>

      {/* No articles section for now */}
      <div className="px-4 text-center text-muted-foreground py-10">
        <p className="text-sm">Article history and liked posts will appear here.</p>
        <p className="text-xs mt-1">Start reading to build your collection.</p>
      </div>
    </div>
  );
}
