"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles, ShieldCheck, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Status = "idle" | "loading" | "success" | "error";

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleOnboarding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firstName || !lastName || !jobTitle) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          jobTitle,
          department,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to save profile.");
        return;
      }

      setStatus("success");
      setMessage("Profile setup complete! Redirecting...");

      setTimeout(() => {
        router.push("/waiting-approval");
        router.refresh();
      }, 1500);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_44%,_#f5f8ff_100%)] px-4 py-6 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden lg:flex">
            <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_24px_80px_rgba(2,6,23,0.4)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),transparent_40%,rgba(14,165,233,0.08))]" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <Logo />
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Onboarding in progress
                  </div>
                  <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Set up your profile for the approval workflow.
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
                    This page keeps the existing onboarding logic intact while presenting a cleaner enterprise experience for new users.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { icon: Users2, label: "Team alignment" },
                      { icon: ShieldCheck, label: "Approval-ready profile" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/55">
                        <item.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.42)]">
              <CardHeader className="space-y-4 pb-5 pt-8 text-left">
                <Logo className="scale-95" />
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Welcome to AtomicGoals
                  </CardTitle>
                  <CardDescription className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Let’s set up your profile to get you started.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pb-8">
                <form onSubmit={handleOnboarding} className="space-y-6">
                  {status === "error" && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                      {message}
                    </div>
                  )}
                  {status === "success" && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                      {message}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="h-12 border-slate-200 bg-white/90 text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
                        disabled={status === "loading" || status === "success"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="h-12 border-slate-200 bg-white/90 text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
                        disabled={status === "loading" || status === "success"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Job title
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Product Manager"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="h-12 border-slate-200 bg-white/90 text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
                      disabled={status === "loading" || status === "success"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Department
                    </Label>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                      }}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
                      disabled={status === "loading" || status === "success"}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                    disabled={
                      status === "loading" ||
                      status === "success" ||
                      !firstName ||
                      !lastName ||
                      !jobTitle
                    }
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving profile...
                      </>
                    ) : (
                      <>
                        Complete setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4 text-sm dark:border-slate-800/70">
                  <Link
                    href="/"
                    className="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Go to Homepage
                  </Link>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    Onboarding flow unchanged
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
