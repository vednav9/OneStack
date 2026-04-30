import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Settings, Bookmark, ThumbsUp, Clock, Calendar } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import api from "../services/api";
import { uploadProfilePhoto } from "../services/userService";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, fetchUser, logout } = useAuthStore();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formState, setFormState] = useState({ name: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // For now, only own profile is shown (no public profiles API yet)
  const isOwnProfile = !username || username === "me" || user?.name === username;
  const displayProfile = isOwnProfile ? profile : null;
  const displayName = displayProfile?.name || username || "User";

  useDocumentTitle(`${displayName} | Profile`);

  useEffect(() => {
    if (!isOwnProfile) return;
    setProfile(user);
  }, [isOwnProfile, user]);

  useEffect(() => {
    if (!isOwnProfile) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchUser()
      .then((data) => {
        if (!cancelled && data) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fetchUser, isOwnProfile]);

  useEffect(() => {
    if (!displayProfile) return;
    setFormState({
      name: displayProfile.name || "",
    });
  }, [displayProfile]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  const savedCount = displayProfile?._count?.savedBlogs ?? 0;
  const upvotedCount = displayProfile?._count?.blogUpvotes ?? 0;
  const historyCount = displayProfile?._count?.readingHistory ?? 0;

  const joinedDate = displayProfile?.createdAt
    ? new Date(displayProfile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  async function handleSaveProfile() {
    if (!isOwnProfile) return;
    setSaving(true);
    setError(null);
    try {
      if (photoFile) {
        const updatedPhoto = await uploadProfilePhoto(photoFile);
        setProfile(updatedPhoto);
        useAuthStore.setState({ user: updatedPhoto });
        setPhotoFile(null);
        setPhotoPreview("");
      }
      const payload = {
        name: formState.name.trim() || null,
      };
      const updated = await api.put("/user/profile", payload);
      setProfile(updated);
      useAuthStore.setState({ user: updated });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProfile() {
    if (!isOwnProfile || isDeleting) return;
    const confirmed = window.confirm("This will permanently delete your account and data. Continue?");
    if (!confirmed) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.del("/user/profile");
      await logout();
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative mb-16 border" />

      {/* Profile Header */}
      <div className="px-4 relative -mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Avatar className="h-32 w-32 border-4 border-background bg-card shadow-lg ring-offset-background">
              <AvatarImage src={displayProfile?.userPhoto} />
              <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{displayName}</h1>
              {displayProfile?.email && (
                <p className="text-lg text-muted-foreground mt-1 font-medium">{displayProfile.email}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button
                variant="outline"
                className="rounded-full shadow-sm px-6 h-11 border-border bg-card hover:bg-secondary"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                {isEditing ? "Close" : "Edit Profile"}
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

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}

        {isOwnProfile && isEditing && (
          <div className="mt-6 rounded-2xl border bg-card p-6 space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <Input
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile photo</label>
              <div className="mt-2 flex items-center gap-4">
                <Avatar className="h-14 w-14 border bg-card">
                  <AvatarImage src={photoPreview || displayProfile?.userPhoto} />
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG, or WEBP up to 2MB.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSaveProfile} isLoading={saving}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setFormState({
                    name: displayProfile?.name || "",
                  });
                  setPhotoFile(null);
                  setPhotoPreview("");
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3">Danger zone</p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteProfile}
                isLoading={isDeleting}
              >
                Delete account
              </Button>
            </div>
          </div>
        )}

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
              <span className="text-2xl font-bold">{upvotedCount}</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upvoted</span>
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

    </div>
  );
}
