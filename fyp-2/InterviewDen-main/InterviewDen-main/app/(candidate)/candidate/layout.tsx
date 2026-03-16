"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/app-sidebar";
import { Header } from "@/components/header";
import { Home, Briefcase, FileText, Calendar, User, HelpCircle, LogOut } from "lucide-react";

const iconMap = {
  Home,
  Briefcase,
  FileText,
  Calendar,
  User,
  HelpCircle,
  LogOut,
};

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/candidate/dashboard",
      icon: "Home",
    },
    {
      title: "Jobs",
      href: "/candidate/jobs",
      icon: "Briefcase",
    },
    {
      title: "Tests",
      href: "/candidate/tests",
      icon: "FileText",
    },
    {
      title: "Feedbacks",
      href: "/candidate/feedback",
      icon: "Calendar",
    },
    {
      title: "Profile",
      href: "/candidate/profile",
      icon: "User",
    },
    {
      title: "Logout",
      href: "/login",
      icon: "LogOut",
      className: "text-red-500 hover:text-red-600",
    }
  ];


  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={sidebarItems}
        userType="candidate"
        aiAssistantTitle="Career Assistant"
        iconMap={iconMap}
      />
      <div className="flex-1">
        <Header userType="candidate" />
        <main className="overflow-y-auto ml-64">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
