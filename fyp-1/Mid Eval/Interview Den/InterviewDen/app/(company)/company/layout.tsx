"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/app-sidebar";
import { Header } from "@/components/header";
import { Home, Users, Briefcase, Calendar, FileText, BarChart, HelpCircle, Settings } from "lucide-react";

const sidebarItems = [
  { title: "Dashboard", href: "/company/dashboard", icon: "Home" },
  { title: "Candidates", href: "/company/candidates", icon: "Users" },
  { title: "Jobs", href: "/company/jobs", icon: "Briefcase" },
  { title: "Interviews", href: "/company/interviews", icon: "Calendar" },
  { title: "Tests", href: "/company/tests", icon: "FileText" },
  { title: "Analytics", href: "/company/analytics", icon: "BarChart" },
  { title: "Help Center", href: "/company/help", icon: "HelpCircle" },
  { title: "Settings", href: "/company/settings", icon: "Settings" },
];

const iconMap = {
  Home,
  Users,
  Briefcase,
  Calendar,
  FileText,
  BarChart,
  HelpCircle,
  Settings,
};

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar 
        items={sidebarItems} 
        userType="company" 
        iconMap={iconMap}
      />
      <div className="flex-1 flex flex-col ml-64">
        <Header userType="company" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
