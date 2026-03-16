"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InterviewDenLogo } from "@/components/logo"

interface SidebarProps {
  items: {
    title: string;
    href: string;
    icon: string;
  }[];
  userType: "candidate" | "company";
  aiAssistantTitle?: string;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  className?: string;
}

export function Sidebar({
  className,
  items,
  userType,
  aiAssistantTitle = userType === "candidate" ? "AI Assistant" : "AI Recruiter",
  iconMap,
  isCollapsed = false,
  setIsCollapsed,
  ...props
}: SidebarProps) {
  const pathname = usePathname()

  const sidebarBgColor = userType === "candidate" ? "bg-indigo-600" : "bg-violet-600"
  const sidebarBorderColor = userType === "candidate" ? "border-indigo-500" : "border-violet-500"
  const sidebarHoverColor = userType === "candidate" ? "hover:bg-indigo-700" : "hover:bg-violet-700"
  const sidebarTextColor = "text-white"
  const sidebarTextHoverColor = "hover:text-white"
  const sidebarTextInactiveColor = userType === "candidate" ? "text-indigo-100" : "text-violet-100"
  const aiBoxBgColor = userType === "candidate" ? "bg-indigo-700" : "bg-violet-700"
  const aiBoxTextColor = userType === "candidate" ? "text-indigo-200" : "text-violet-200"
  const aiButtonBgColor = userType === "candidate" ? "text-indigo-700" : "text-violet-700"
  const aiButtonHoverColor = userType === "candidate" ? "hover:bg-indigo-100" : "hover:bg-violet-100"

  return (
    <div className={cn("hidden md:flex w-64 flex-col fixed inset-y-0 z-50", sidebarBgColor, className)} {...props}>
      <div className={cn("flex h-16 items-center px-4 border-b", sidebarBorderColor)}>
        <Link href="/" className="flex items-center gap-2 text-white">
          <InterviewDenLogo />
          <h1 className="text-xl font-bold">InterviewDen</h1>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = iconMap[item.icon]
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "flex justify-start gap-2 px-3 py-2 h-auto",
                  isActive ? sidebarTextColor : sidebarTextInactiveColor,
                  sidebarTextHoverColor,
                  sidebarHoverColor,
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
      <div className="p-4 mt-auto">
        <div className={cn("rounded-lg p-4 text-white", aiBoxBgColor)}>
          <h3 className="font-medium flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {aiAssistantTitle}
          </h3>
          <p className={cn("text-xs mb-3", aiBoxTextColor)}>
            {userType === "candidate"
              ? "Get personalized career advice and interview tips"
              : "Get AI-powered insights and candidate recommendations"}
          </p>
          <Button size="sm" className={cn("w-full bg-white hover:bg-slate-100", aiButtonBgColor, aiButtonHoverColor)}>
            Ask AI
          </Button>
        </div>
      </div>
    </div>
  )
}
