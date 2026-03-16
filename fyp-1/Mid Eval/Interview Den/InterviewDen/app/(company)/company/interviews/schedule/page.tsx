import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Calendar as CalendarIcon } from "lucide-react"

export default function ScheduleInterviewPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Schedule Interview
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Schedule interviews with candidates and manage your interview calendar.
        </p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Schedule New</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Interview</CardTitle>
              <CardDescription>Fill in the details to schedule an interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Candidate</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alex">Alex Johnson - Frontend Developer</SelectItem>
                    <SelectItem value="sarah">Sarah Williams - UX Designer</SelectItem>
                    <SelectItem value="michael">Michael Brown - Backend Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                    <SelectItem value="system-design">System Design Interview</SelectItem>
                    <SelectItem value="culture-fit">Culture Fit Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input type="date" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input type="time" className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interviewers</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interviewers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Smith - Tech Lead</SelectItem>
                    <SelectItem value="emma">Emma Davis - HR Manager</SelectItem>
                    <SelectItem value="david">David Wilson - Engineering Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Meeting Link</Label>
                <Input placeholder="https://meet.google.com/..." />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Add any additional notes or instructions..." />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button>Schedule Interview</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Your scheduled interviews for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((interview) => (
                <Card key={interview}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Technical Interview</h3>
                        <p className="text-sm text-slate-500">Alex Johnson - Frontend Developer</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarIcon className="h-4 w-4" />
                          <span>April 15, 2024 - 10:00 AM</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users className="h-4 w-4" />
                          <span>John Smith, Emma Davis</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Calendar</CardTitle>
              <CardDescription>View and manage your interview schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 