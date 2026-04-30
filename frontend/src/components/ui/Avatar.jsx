import React, { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

const DEFAULT_AVATAR_SRC = "/avatar-placeholder.svg";

function normalizeAvatarUrl(src) {
  const value = String(src || "").trim();
  if (!value) return "";
  if (/googleusercontent\.com/i.test(value) && !/[?&]sz=|=s\d+/i.test(value)) {
    return `${value}=s256-c`;
  }
  return value;
}

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className, src, ...props }, ref) => {
  const [imageSrc, setImageSrc] = useState(normalizeAvatarUrl(src) || DEFAULT_AVATAR_SRC);

  useEffect(() => {
    setImageSrc(normalizeAvatarUrl(src) || DEFAULT_AVATAR_SRC);
  }, [src]);

  return (
    <img
      ref={ref}
      src={imageSrc}
      className={cn("absolute inset-0 h-full w-full object-cover z-10", className)}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => setImageSrc(DEFAULT_AVATAR_SRC)}
      {...props}
    />
  );
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute inset-0 flex items-center justify-center rounded-full bg-muted z-0",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
