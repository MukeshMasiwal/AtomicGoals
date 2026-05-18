"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl ">
          <CardHeader className="space-y-4 pb-6 flex flex-col items-center text-center">
            <Logo className="mb-2" />
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Welcome to AtomicGoals
              </CardTitle>
              <CardDescription className="text-base">
                Let's set up your profile to get you started.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleOnboarding} className="space-y-6">
              {status === "error" && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
                  {message}
                </div>
              )}
              {status === "success" && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400">
                  {message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-transparent"
                    disabled={status === "loading" || status === "success"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-transparent"
                    disabled={status === "loading" || status === "success"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Product Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="bg-transparent"
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                  }}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  disabled={status === "loading" || status === "success"}
                >
                  <option value="Engineering" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Engineering</option>
                  <option value="Product" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Product</option>
                  <option value="Design" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Design</option>
                  <option value="Marketing" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Marketing</option>
                  <option value="Sales" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Sales</option>
                  <option value="HR" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">HR</option>
                  <option value="Finance" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Finance</option>
                  <option value="Operations" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Operations</option>
                  <option value="Customer Support" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Customer Support</option>
                  <option value="Management" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Management</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
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
                  "Complete Setup"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Go to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
