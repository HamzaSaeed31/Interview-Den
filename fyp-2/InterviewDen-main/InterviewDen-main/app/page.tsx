import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InterviewDenLogo } from "@/components/logo"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <InterviewDenLogo className="w-8 h-8" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                InterviewDen
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                Features
              </Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                How It Works
              </Link>
              <Link href="#pricing" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                Log in
              </Link>
              <Link href="/signup" passHref>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              AI-Powered Recruitment Platform
            </h1>
            <p className="mt-6 text-xl text-slate-600">
              Streamline your hiring process with AI-driven interviews, automated assessments, and unbiased candidate
              evaluation.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup?type=company" passHref>
                <Button className="bg-violet-600 hover:bg-violet-700 text-lg py-6 px-8">I'm a Company</Button>
              </Link>
              <Link href="/signup?type=candidate" passHref>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-lg py-6 px-8">I'm a Candidate</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform offers a comprehensive suite of tools to make recruitment efficient, fair, and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">AI-Powered Interviews</h3>
              <p className="text-slate-600">
                Conduct automated interviews with AI that adapts to candidate responses and provides objective
                evaluations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-violet-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Customizable Assessments</h3>
              <p className="text-slate-600">
                Create tailored tests and assessments to evaluate candidates' skills, knowledge, and problem-solving
                abilities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-rose-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Data-Driven Insights</h3>
              <p className="text-slate-600">
                Get comprehensive analytics and insights to make informed hiring decisions and improve your recruitment
                process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform simplifies the recruitment process for both companies and candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Companies */}
            <div>
              <h3 className="text-2xl font-bold text-violet-600 mb-6">For Companies</h3>
              <ol className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Create Job Listings</h4>
                    <p className="mt-2 text-slate-600">
                      Define job requirements, skills, and qualifications for your open positions.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Design Assessments</h4>
                    <p className="mt-2 text-slate-600">
                      Create customized tests and interview questions tailored to your specific needs.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Review AI-Ranked Candidates</h4>
                    <p className="mt-2 text-slate-600">
                      Get AI-powered insights and rankings of candidates based on their performance.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Make Data-Driven Decisions</h4>
                    <p className="mt-2 text-slate-600">
                      Use comprehensive analytics to select the best candidates for your team.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* For Candidates */}
            <div>
              <h3 className="text-2xl font-bold text-indigo-600 mb-6">For Candidates</h3>
              <ol className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Create Your Profile</h4>
                    <p className="mt-2 text-slate-600">
                      Upload your resume and complete your profile with skills and experience.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Discover Matching Jobs</h4>
                    <p className="mt-2 text-slate-600">
                      Browse job listings or receive AI-recommended positions that match your skills.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Complete Assessments</h4>
                    <p className="mt-2 text-slate-600">
                      Take skills tests and participate in AI-powered interviews at your convenience.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Track Your Applications</h4>
                    <p className="mt-2 text-slate-600">
                      Monitor the status of your applications and receive feedback on your performance.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Pricing Plans
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the plan that best fits your recruitment needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">Basic</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$99</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                </div>
                <p className="mt-4 text-slate-600">Perfect for small businesses and startups.</p>
              </div>
              <div className="border-t border-slate-200 px-6 py-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Up to 10 job postings</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Basic AI assessments</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Email support</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg border-2 border-indigo-600 shadow-lg relative">
              <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                <div className="inline-block bg-indigo-600 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Most Popular
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">Pro</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$249</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                </div>
                <p className="mt-4 text-slate-600">Ideal for growing companies and teams.</p>
              </div>
              <div className="border-t border-slate-200 px-6 py-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Up to 50 job postings</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Advanced AI assessments</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Custom interview templates</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Priority support</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">Enterprise</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                </div>
                <p className="mt-4 text-slate-600">For large organizations with specific needs.</p>
              </div>
              <div className="border-t border-slate-200 px-6 py-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Unlimited job postings</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Custom AI models</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">API access</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 0L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-600">Dedicated account manager</span>
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Contact Sales</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <InterviewDenLogo className="w-8 h-8" />
                <span className="ml-2 text-xl font-bold">InterviewDen</span>
              </div>
              <p className="mt-4 text-slate-400">AI-powered recruitment platform for efficient and unbiased hiring.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-slate-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-slate-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} InterviewDen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
