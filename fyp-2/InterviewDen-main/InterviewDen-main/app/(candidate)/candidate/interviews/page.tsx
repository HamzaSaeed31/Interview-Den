import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Video } from "lucide-react"

export default function InterviewsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          My Interviews
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          View and manage your upcoming interviews.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Your scheduled interviews for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((interview) => (
                <Card key={interview}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Technical Interview</h3>
                        <p className="text-sm text-slate-500">TechCorp Inc.</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>April 15, 2024 - 10:00 AM</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users className="h-4 w-4" />
                          <span>John Smith, Emma Davis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Video className="h-4 w-4" />
                          <span>Google Meet</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Join Meeting
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Interviews</CardTitle>
              <CardDescription>Your completed interviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1].map((interview) => (
                <Card key={interview}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Initial Screening</h3>
                        <p className="text-sm text-slate-500">TechCorp Inc.</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>April 10, 2024 - 2:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users className="h-4 w-4" />
                          <span>Emma Davis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Feedback
                      </Button>
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
              <CardDescription>View your interview schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-slate-500">Calendar view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 