"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/ui/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"
import { NotificationDropdown } from "@/components/notification-dropdown"

interface HeaderProps {
  userType: "candidate" | "company"
}

export function Header({ userType }: HeaderProps) {
  const supabase = createClient()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, name")
        .eq("id", user.id)
        .single()

      if (profile) {
        setAvatarUrl(profile.avatar_url)
        setUserName(profile.name || "")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const sidebarItems =
    userType === "candidate"
      ? [
        { title: "Dashboard", href: "/candidate/dashboard", icon: User },
        { title: "Jobs", href: "/candidate/jobs", icon: Search },
        { title: "Profile", href: "/candidate/profile", icon: User },
        { title: "Settings", href: "/candidate/settings", icon: Bell },
      ]
      : [
        { title: "Dashboard", href: "/company/dashboard", icon: User },
        { title: "Candidates", href: "/company/candidates", icon: Search },
        { title: "Jobs", href: "/company/jobs", icon: User },
        { title: "Settings", href: "/company/settings", icon: Bell },
      ]

  const headerBgColor =
    userType === "candidate" ? "bg-white border-b border-gray-200" : "bg-white border-b border-gray-200"
  const headerTextColor = userType === "candidate" ? "text-gray-800" : "text-gray-800"
  const buttonBgColor =
    userType === "candidate" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-violet-600 hover:bg-violet-700"

  return (
    <header className={`sticky top-0 z-40 ${headerBgColor}`}>
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar items={sidebarItems} userType={userType} />
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-white pl-8 md:w-[200px] lg:w-[300px]"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="outline" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <NotificationDropdown userType={userType} />

          <Button variant="outline" size="icon" className="rounded-full p-0 h-10 w-10" asChild>
            <Link href={`/${userType}/profile`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || undefined} alt={userName} />
                <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                  {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
