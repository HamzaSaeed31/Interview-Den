import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Globe } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your personal and professional information
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="San Francisco, CA" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Update your work and education details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Position</Label>
              <Input placeholder="Senior Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input placeholder="TechCorp" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn Profile</Label>
              <Input placeholder="linkedin.com/in/yourprofile" />
            </div>
            <div className="space-y-2">
              <Label>Portfolio Website</Label>
              <Input placeholder="yourwebsite.com" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Write a brief bio about yourself..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Add your educational background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input placeholder="Bachelor of Science in Computer Science" />
            </div>
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input placeholder="University of Technology" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 