"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, AlertCircle, Loader2, Briefcase } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface OngoingTest {
  id: string;
  job_id: string;
  job_title: string;
  current_stage: string;
  applied_at: string;
  updated_at: string;
}

export default function TestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [ongoingTests, setOngoingTests] = useState<OngoingTest[]>([]);

  useEffect(() => {
    fetchOngoingTests();
  }, []);

  const fetchOngoingTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch applications that are not completed
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          current_stage,
          applied_at,
          updated_at,
          jobs!inner (
            title
          )
        `)
        .eq('candidate_id', user.id)
        .neq('current_stage', 'completed')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching tests:', error);
      } else {
        const tests = (data || []).map((app: any) => ({
          id: app.id,
          job_id: app.job_id,
          job_title: app.jobs?.title || 'Unknown Job',
          current_stage: app.current_stage,
          applied_at: app.applied_at,
          updated_at: app.updated_at,
        }));
        setOngoingTests(tests);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressValue = (stage: string) => {
    switch (stage) {
      case 'resume': return 0;
      case 'quiz': return 33;
      case 'interview': return 66;
      default: return 0;
    }
  };

  const getStageName = (stage: string) => {
    switch (stage) {
      case 'resume': return 'Resume Screening';
      case 'quiz': return 'AI Quiz';
      case 'interview': return 'AI Interview';
      default: return stage;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleResumeTest = (test: OngoingTest) => {
    router.push(`/candidate/screening/${test.current_stage}?jobId=${test.job_id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ongoing Tests</h1>
        <Button onClick={() => router.push("/candidate/jobs")}>
          Find More Jobs
        </Button>
      </div>

      {ongoingTests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No ongoing tests found</p>
            <p className="text-sm text-muted-foreground mb-4">
              All your applications are either completed or you haven&apos;t applied yet
            </p>
            <Button className="mt-4" onClick={() => router.push("/candidate/jobs")}>
              Apply for Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ongoingTests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle className="text-xl">{test.job_title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Last updated: {getTimeAgo(test.updated_at)}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current Step</span>
                    <span className="font-medium">{getStageName(test.current_stage)}</span>
                  </div>
                  <Progress value={getProgressValue(test.current_stage)} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Applied: {new Date(test.applied_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleResumeTest(test)}>
                  Resume Test
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}