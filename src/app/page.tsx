import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Target,
  Workflow,
  Calendar,
  LayoutDashboard,
  FileBarChart,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "Goal Management",
    description:
      "Create, assign, and align goals across teams with clear ownership and measurable key results.",
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Approval Workflow",
    description:
      "Route goals for manager review and capture approvals seamlessly in minutes.",
    icon: Workflow,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    title: "Quarterly Tracking",
    description:
      "Track outcomes by quarter with milestones, health metrics, and early blocker detection.",
    icon: Calendar,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    title: "Real-Time Dashboards",
    description:
      "Monitor performance trends with live progress bars and aggregated team health signals.",
    icon: LayoutDashboard,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    title: "Reporting & Export",
    description:
      "Generate board-ready reports with shareable, exportable views for all stakeholders.",
    icon: FileBarChart,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    title: "Audit Tracking",
    description:
      "Maintain strict compliance with an automated, immutable audit trail for every change.",
    icon: ShieldCheck,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Employee Creates Goal",
    desc: "Set clear objectives using structured templates.",
  },
  {
    step: "02",
    title: "Manager Reviews Goal",
    desc: "Align on expectations and approve quickly.",
  },
  {
    step: "03",
    title: "Performance Tracking",
    desc: "Log real-time progress and milestones.",
  },
  {
    step: "04",
    title: "Quarterly Review",
    desc: "Evaluate outcomes and plan the next cycle.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/50 font-sans text-foreground ">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex gap-8 text-sm font-medium text-foreground/80 ">
            <Link
              href="#features"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Features
            </Link>
            <Link
              href="#workflow"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Workflow
            </Link>
            <Link
              href="#impact"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Impact
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="inline-flex h-9 px-3 text-sm text-foreground/80 hover:text-indigo-600 dark:hover:text-indigo-400 sm:h-10 sm:px-4"
              >
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pb-48">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20 mb-8">
              AtomicGoals Performance Portal
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-8 leading-tight">
              Modern Goal Tracking for <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">
                High-Performance Teams
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 dark:text-muted-foreground mb-10 max-w-2xl mx-auto">
              Empower employees to create goals, managers to approve them, and
              leadership to track quarterly progress in one centralized
              platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-base h-12 px-8"
                >
                  Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card ">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                Features
              </h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Everything you need to run goal cycles
              </p>
              <p className="mt-4 text-lg text-foreground/80 dark:text-muted-foreground">
                Streamline approvals, align priorities, and deliver real-time
                performance visibility across the organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative p-8 rounded-3xl bg-muted/50 dark:bg-slate-800/50 hover:bg-card dark:hover:bg-slate-800 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none transition-all duration-300"
                >
                  <div
                    className={`inline-flex items-center justify-center rounded-xl p-3 mb-6 ${feature.bg}`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/80 dark:text-muted-foreground leading-relaxed text-base">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-24 bg-muted/50 ">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                Workflow
              </h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Aligned, transparent, and fast
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
              {workflowSteps.map((step) => (
                <div
                  key={step.step}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card border-4 border-slate-50 shadow-md mb-6 relative">
                    <div className="absolute inset-2 rounded-full border border-indigo-100 dark:border-indigo-900 flex items-center justify-center bg-indigo-50/50 dark:bg-indigo-500/10 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-foreground/80 dark:text-muted-foreground text-sm max-w-[200px]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section
          id="impact"
          className="py-24 bg-indigo-600 dark:bg-indigo-950 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-base font-semibold text-indigo-200 uppercase tracking-wide">
                Impact
              </h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Measurable results in every cycle
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Faster Goal Approvals", value: "90%" },
                { label: "Centralized Tracking", value: "100%" },
                { label: "Performance Visibility", value: "24/7" },
                { label: "Quarterly Reviews", value: "4X" },
              ].map((stat) => (
                <div key={stat.label} className="p-6">
                  <div className="text-4xl md:text-5xl font-extrabold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-indigo-200 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-card ">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">
              Start Managing Goals Smarter
            </h2>
            <p className="text-lg text-foreground/80 dark:text-muted-foreground mb-10 max-w-2xl mx-auto">
              Bring clarity to performance cycles with a modern platform
              designed for speed, accountability, and measurable outcomes.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg text-base h-14 px-10 rounded-full"
              >
                Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm text-muted-foreground dark:text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} AtomicGoals. All rights reserved.
          </div>
          <Logo showText={false} />
        </div>
      </footer>
    </div>
  );
}
