import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function CandidateHelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Find answers to common questions and learn how to make the most of InterviewDen.
        </p>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 h-auto">
          <TabsTrigger
            value="faq"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            FAQ
          </TabsTrigger>
          <TabsTrigger
            value="guides"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Guides
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to the most common questions about using InterviewDen as a candidate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I create a strong profile?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">To create a strong profile, make sure to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Upload a professional and recent photo</li>
                      <li>Complete all sections of your profile</li>
                      <li>Highlight your key skills and experiences</li>
                      <li>Include relevant certifications and education</li>
                      <li>Keep your availability information up to date</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How does the AI interview process work?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">The AI interview process typically involves:</p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Receiving an interview invitation after applying for a position</li>
                      <li>Scheduling a time for your AI interview</li>
                      <li>Participating in a video, audio, or text-based interview with our AI</li>
                      <li>Answering questions related to your experience and the job requirements</li>
                      <li>Receiving feedback and next steps after the interview is analyzed</li>
                    </ol>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                      Our AI is designed to provide a fair and objective assessment of your qualifications.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>How can I prepare for skills assessments?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">To prepare for skills assessments:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Review the job description to understand required skills</li>
                      <li>Practice relevant technical problems and concepts</li>
                      <li>Take advantage of our practice assessments in your dashboard</li>
                      <li>Ensure you have a stable internet connection and quiet environment</li>
                      <li>Familiarize yourself with the assessment platform beforehand</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>What should I do if I encounter technical issues?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">If you encounter technical issues:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Refresh your browser or restart the application</li>
                      <li>Check your internet connection</li>
                      <li>Make sure your camera and microphone permissions are enabled</li>
                      <li>Try using a different browser or device</li>
                      <li>Contact our support team through the "Contact Support" tab</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How is my data used and protected?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-600 dark:text-slate-400">We take data privacy seriously. Your data is:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Encrypted and stored securely</li>
                      <li>Only shared with companies you apply to</li>
                      <li>Used to improve our AI matching algorithms</li>
                      <li>Never sold to third parties</li>
                      <li>Handled in compliance with data protection regulations</li>
                    </ul>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                      You can review our full privacy policy in your account settings.
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
              <CardTitle>Candidate Guides</CardTitle>
              <CardDescription>Step-by-step guides to help you navigate the job search process.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Creating Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Learn how to create a standout profile that attracts employers.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Mastering AI Interviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Tips and strategies for performing well in AI-powered interviews.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Acing Skills Assessments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Preparation strategies for technical and soft skills assessments.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Job Search Strategies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      How to effectively search and apply for jobs that match your skills.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Resume Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      How to optimize your resume for AI screening and human reviewers.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Using AI Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Getting the most out of our AI career assistant for personalized advice.
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
                    <h3 className="font-medium text-slate-900 dark:text-white">Email Support</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Send us an email and we'll get back to you within 24 hours.
                    </p>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">support@interviewden.com</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-slate-900 dark:text-white">Live Chat</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Chat with our support team during business hours.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Monday - Friday, 9am - 5pm EST</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-6">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">Submit a Support Ticket</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
  )
}
