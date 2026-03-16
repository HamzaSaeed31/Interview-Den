"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt = "User avatar", fallback = "/avatars/default.png", size = "md", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
      sizeClasses[size],
      className
    )}
    {...props}
  >
    <AvatarPrimitive.Image
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = fallback;
      }}
    />
    <AvatarPrimitive.Fallback
      className="flex h-full w-full items-center justify-center"
      delayMs={600}
    >
      <User className="h-1/2 w-1/2 text-slate-400" />
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

export { Avatar }
