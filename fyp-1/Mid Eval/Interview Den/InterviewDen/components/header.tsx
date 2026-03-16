"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/ui/app-sidebar"

interface HeaderProps {
  userType: "candidate" | "company"
}

export function Header({ userType }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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

          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button variant="outline" size="icon" asChild>
            <Link href={`/${userType}/profile`}>
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
