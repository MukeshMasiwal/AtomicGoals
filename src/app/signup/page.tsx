"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

type Status = "idle" | "loading" | "success" | "error";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
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

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        user?: { email?: string; name?: string };
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Signup failed.");
        return;
      }

      setStatus("success");
      setMessage("Profile submitted. Waiting for approval.");
      router.push("/waiting-approval");
    } catch {
      setStatus("error");
      setMessage("Signup failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl ">
          <CardHeader className="space-y-4 pb-6 flex flex-col items-center text-center">
            <Logo className="mb-2" />
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Create Account
              </CardTitle>
              <CardDescription className="text-base">
                Sign up to get started with AtomicGoals.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-transparent"
                  disabled={status === "loading"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-transparent"
                  disabled={status === "loading"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="e.g. Product Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="bg-transparent"
                  disabled={status === "loading"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  disabled={status === "loading"}
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
                <p className="text-xs text-muted-foreground">
                  Department helps admins place you in the right team.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                disabled={status === "loading" || !firstName || !lastName || !jobTitle}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Log in
              </Link>
            </div>
          </CardContent>

          <CardFooter className="pt-2 text-center text-sm flex flex-col gap-2 border-t border-slate-100 mt-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground/80 dark:hover:text-slate-200"
            >
              Go to Homepage
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
