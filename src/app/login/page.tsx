"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, UserCog, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to send OTP.");
        return;
      }

      setStatus("success");
      setMessage("A login code has been sent to your email.");
      setStep("otp");
    } catch {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !otp) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        user?: { email?: string; name?: string };
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Invalid login code.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${data.user?.name || data.user?.email || email}. Redirecting…`);
      router.push("/dashboard");
    } catch {
      setStatus("error");
      setMessage("Verification failed. Please try again.");
    }
  }

  // Development-only helper function for quick seed login
  async function handleSeedLogin(seedEmail: string) {
    // Production safety check
    if (process.env.NODE_ENV !== "development") return;
    
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/seed-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: seedEmail }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        user?: { email?: string; name?: string };
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Seed login failed.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${data.user?.name || seedEmail}. Redirecting…`);
      router.push("/dashboard");
    } catch {
      setStatus("error");
      setMessage("Seed login error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight text-center">
              Welcome
            </CardTitle>
            <CardDescription className="text-base text-center">
              {step === "email" 
                ? "Enter your email to receive a login code." 
                : "Enter the 6-digit code sent to your email."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent"
                    disabled={status === "loading"}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2" 
                  disabled={status === "loading" || !email}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Send Login Code"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                  <Label htmlFor="otp">Login Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="bg-transparent text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={status === "loading"}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2" 
                  disabled={status === "loading" || otp.length < 5}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setStep("email");
                      setStatus("idle");
                      setMessage("");
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Back to email
                  </button>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="pt-2 text-center text-sm flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Link href="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              Back to home
            </Link>
          </CardFooter>
        </Card>

        {/* Development-only seed login section */}
        {process.env.NODE_ENV === "development" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50"
          >
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 text-amber-600 mb-2 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200/50 dark:border-amber-900/50">
                <AlertTriangle className="h-3.5 w-3.5" />
                Development Only
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Quick Demo Access</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Development-only seed users</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleSeedLogin("admin@test.com")}
                disabled={status === "loading"}
                className="group flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-white/60 hover:bg-indigo-50/80 hover:border-indigo-300 transition-all duration-300 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-indigo-950/30 dark:hover:border-indigo-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">Login as Admin</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">admin@test.com</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSeedLogin("manager@test.com")}
                disabled={status === "loading"}
                className="group flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-white/60 hover:bg-emerald-50/80 hover:border-emerald-300 transition-all duration-300 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">Login as Manager</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">manager@test.com</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSeedLogin("employee@test.com")}
                disabled={status === "loading"}
                className="group flex items-center justify-between p-3 rounded-xl border border-sky-100 bg-white/60 hover:bg-sky-50/80 hover:border-sky-300 transition-all duration-300 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-sky-950/30 dark:hover:border-sky-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 text-sky-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 dark:bg-sky-900/50 dark:text-sky-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">Login as Employee</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">employee@test.com</div>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
