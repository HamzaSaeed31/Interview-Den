"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/app-sidebar";
import { Header } from "@/components/header";
import { Home, FileText, Calendar, MessageSquare, HelpCircle, Settings, Search, Briefcase, Video, User, LayoutDashboard, ClipboardList } from "lucide-react";

const iconMap = {
  Home,
  Search,
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  HelpCircle,
  Settings,
  Video,
  User,
  LayoutDashboard,
  ClipboardList,
};

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/candidate",
      icon: "LayoutDashboard",
    },
    {
      title: "My Resume",
      href: "/candidate/cv",
      icon: "FileText",
    },
    {
      title: "Find Jobs",
      href: "/candidate/jobs",
      icon: "Search",
    },
    {
      title: "Interviews",
      href: "/candidate/tests",
      icon: "Calendar",
    },
    {
      title: "Feedback",
      href: "/candidate/feedback",
      icon: "MessageSquare",
    },
    {
      title: "Settings",
      href: "/candidate/settings",
      icon: "Settings",
    },
    {
      title: "Profile",
      href: "/candidate/profile",
      icon: "User",
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={sidebarItems}
        userType="candidate"
        aiAssistantTitle="Interview Coach"
        iconMap={iconMap}
      />
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
