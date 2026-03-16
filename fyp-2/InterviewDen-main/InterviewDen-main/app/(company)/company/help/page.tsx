import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CompanyHelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Help Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Find answers to common questions and learn how to make the most of
          InterviewDen for your recruitment needs.
        </p>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 h-auto">
          <TabsTrigger
            value="faq"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400"
          >
            FAQ
          </TabsTrigger>
          <TabsTrigger
            value="guides"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400"
          >
            Guides
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400"
          >
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to the most common questions about using
                InterviewDen for recruitment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How do I create an effective job posting?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">
                      To create an effective job posting:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        Be specific about required skills and qualifications
                      </li>
                      <li>
                        Clearly describe responsibilities and expectations
                      </li>
                      <li>Include information about your company culture</li>
                      <li>Specify salary range and benefits</li>
                      <li>
                        Use our AI optimization tool to improve your posting's
                        effectiveness
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    How does the AI candidate screening work?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">
                      Our AI candidate screening process:
                    </p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        Analyzes resumes and applications against your job
                        requirements
                      </li>
                      <li>
                        Evaluates candidates based on skills, experience, and
                        qualifications
                      </li>
                      <li>
                        Ranks candidates according to their match percentage
                      </li>
                      <li>
                        Provides insights on each candidate's strengths and
                        potential gaps
                      </li>
                      <li>Recommends which candidates to move forward with</li>
                    </ol>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                      The AI is designed to be unbiased and focus solely on
                      qualifications relevant to the position.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    How do I set up custom assessments?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">
                      To set up custom assessments:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Go to the "Tests" section in your dashboard</li>
                      <li>Click on "Create New Test"</li>
                      <li>
                        Select the type of assessment (technical, cognitive,
                        etc.)
                      </li>
                      <li>
                        Add your custom questions or use our AI to generate
                        relevant questions
                      </li>
                      <li>Set the difficulty level and time limits</li>
                      <li>Save and assign to job postings as needed</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    How are AI interviews conducted?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">
                      AI interviews are conducted as follows:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        Candidates receive an invitation to schedule their
                        interview
                      </li>
                      <li>They can choose a time that works for them</li>
                      <li>
                        The AI conducts the interview via video, audio, or text
                      </li>
                      <li>
                        Questions are based on the job requirements and your
                        custom questions
                      </li>
                      <li>
                        The AI analyzes responses for content, communication
                        skills, and other factors
                      </li>
                      <li>
                        You receive a detailed report with insights and
                        recommendations
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    What subscription plans are available?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">
                      We offer several subscription plans:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        <strong>Basic:</strong> Up to 10 job postings, basic AI
                        assessments, email support
                      </li>
                      <li>
                        <strong>Pro:</strong> Up to 50 job postings, advanced AI
                        assessments, custom interview templates, priority
                        support
                      </li>
                      <li>
                        <strong>Enterprise:</strong> Unlimited job postings,
                        custom AI models, API access, dedicated account manager
                      </li>
                    </ul>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                      Visit the "Billing" section in your settings to view
                      detailed plan information and upgrade options.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Recruiter Guides</CardTitle>
              <CardDescription>
                Step-by-step guides to help you optimize your recruitment
                process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Creating Effective Job Postings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Learn how to create job postings that attract the right
                      candidates.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Designing Skills Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      How to create effective skills assessments for different
                      roles.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Configuring AI Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Set up AI interviews that effectively evaluate candidates.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Analyzing Candidate Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      How to interpret AI-generated candidate reports and
                      insights.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Optimizing Your Hiring Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Strategies to streamline and improve your overall hiring
                      workflow.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Using AI Recruitment Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      How to leverage AI-powered analytics to make better hiring
                      decisions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our support team.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Email Support
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Send us an email and we'll get back to you within 24
                      hours.
                    </p>
                    <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                      enterprise@interviewden.com
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Account Manager
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enterprise customers can contact their dedicated account
                      manager.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Monday - Friday, 9am - 5pm EST
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">
                    Submit a Support Ticket
                  </h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-200 rounded-md dark:border-slate-700 dark:bg-slate-800"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-slate-200 rounded-md dark:border-slate-700 dark:bg-slate-800"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md dark:border-slate-700 dark:bg-slate-800"
                        placeholder="What can we help you with?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Message
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-200 rounded-md dark:border-slate-700 dark:bg-slate-800 min-h-[150px]"
                        placeholder="Describe your issue in detail..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-white bg-violet-600 rounded-md hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
                    >
                      Submit Ticket
                    </button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
