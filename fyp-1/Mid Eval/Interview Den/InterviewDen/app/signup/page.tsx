"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { InterviewDenLogo } from "@/components/logo"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "candidate"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect based on user type
    if (type === "candidate") {
      router.push("/candidate/dashboard")
    } else {
      router.push("/company/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <InterviewDenLogo className="w-8 h-8" />
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          InterviewDen
        </span>
      </Link>

      <div className="w-full max-w-md">
        <Tabs defaultValue={type} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="candidate"
              onClick={() => router.push("/signup?type=candidate")}
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Candidate
            </TabsTrigger>
            <TabsTrigger
              value="company"
              onClick={() => router.push("/signup?type=company")}
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
            >
              Company
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidate">
            <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Candidate Account</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">Full Name</Label>
                  <Input
                    id="candidate-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <Input
                    id="candidate-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-password">Password</Label>
                  <Input
                    id="candidate-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-confirm-password">Confirm Password</Label>
                  <Input
                    id="candidate-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="candidate-terms" required />
                  <label
                    htmlFor="candidate-terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-indigo-600 hover:text-indigo-800">
                      terms of service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800">
                      privacy policy
                    </Link>
                  </label>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/login?type=candidate" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Company Account</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Admin Name</Label>
                  <Input
                    id="admin-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-password">Password</Label>
                  <Input
                    id="company-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-confirm-password">Confirm Password</Label>
                  <Input
                    id="company-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="company-terms" required />
                  <label
                    htmlFor="company-terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-violet-600 hover:text-violet-800">
                      terms of service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-violet-600 hover:text-violet-800">
                      privacy policy
                    </Link>
                  </label>
                </div>
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/login?type=company" className="text-violet-600 hover:text-violet-800 font-medium">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
