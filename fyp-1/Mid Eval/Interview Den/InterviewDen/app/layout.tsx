import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ScreeningProvider } from "@/app/context/screening-context";
import {
  Home,
  Users,
  Briefcase,
  ClipboardCheck,
  BarChart2,
  HelpCircle,
  Settings,
} from "lucide-react"; // Import icons

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InterviewDen - AI-Powered Recruitment Platform",
  description:
    "Streamline your recruitment process with AI-driven interviews and candidate assessments",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="interviewden-theme"
        >
          <ScreeningProvider>
            {children}
          </ScreeningProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
