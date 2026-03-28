import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Settings, Bookmark, ThumbsUp, MapPin, Link2, Calendar } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import useBlogs from "../hooks/useBlogs";

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuthStore();
  const { blogs, loading } = useBlogs();

  // If user is viewing their own profile
  const isOwnProfile = user?.username === username || username === "me" || !username;
  
  // Simulated profile data
  const profile = isOwnProfile ? user : {
    name: username,
    username: `@${username}`,
    bio: "Software Engineer passionate about scalable systems and cloud infrastructure.",
    location: "San Francisco, CA",
    website: "https://example.com",
    joined: "March 2026",
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative mb-16 border" />
      
      {/* Profile Header */}
      <div className="px-4 relative -mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Avatar className="h-32 w-32 border-4 border-background bg-card shadow-lg ring-offset-background">
              <AvatarImage src={profile?.profilePicture} />
              <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                {(profile?.name || username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {profile?.name || profile?.fullName || username}
              </h1>
              <p className="text-lg text-muted-foreground mt-1 font-medium">
                {profile?.username || `@${username}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button variant="outline" className="rounded-full shadow-sm px-6 h-11 border-border bg-card hover:bg-secondary">
                <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                Edit Profile
              </Button>
            ) : (
              <Button className="rounded-full px-8 h-11 text-base shadow-sm">
                Follow
              </Button>
            )}
          </div>
        </div>

        {/* Bio & Meta */}
        <div className="mt-8 max-w-2xl">
          <p className="text-base leading-relaxed text-foreground/90">
            {profile?.bio || "A curious engineer exploring the world of software architecture."}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {profile?.location || "Planet Earth"}
            </span>
            <a href={profile?.website || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors hover:underline underline-offset-4">
              <Link2 className="h-4 w-4 shrink-0" />
              {profile?.website?.replace(/^https?:\/\//, '') || "add link"}
            </a>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              Joined {profile?.joined || "recently"}
            </span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-8 mt-8 border-b pb-8">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">12</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">48</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Liked</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">1.2k</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Followers</span>
          </div>
        </div>
      </div>

      {/* Tabs / Content */}
      <div className="mt-2">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 px-4">
          <Bookmark className="h-5 w-5 text-primary" />
          Recent Activity
        </h3>
        
        {/* Feed - showing simulated activity */}
        <BlogFeed blogs={blogs.slice(0, 3)} loading={loading} />
      </div>
    </div>
  );
}
