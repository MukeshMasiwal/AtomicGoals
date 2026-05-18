"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldCheck,
  UserCog,
  User,
  AlertTriangle,
  Clock,
  Info,
} from "lucide-react";
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
type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft > 0 && step === "otp") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const redirectAfterAuth = (redirectTo?: string) => {
    router.replace(redirectTo || "/dashboard");
    router.refresh();
  };

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

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to send OTP.");
        return;
      }

      setStatus("success");
      setMessage("A login code has been sent to your email.");
      setStep("otp");
      setTimeLeft(600); // 10 minutes
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
        user?: { email?: string; name?: string; role?: string };
        redirectTo?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Invalid login code.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${data.user?.name || email}. Redirecting…`);
      redirectAfterAuth(data.redirectTo);
    } catch {
      setStatus("error");
      setMessage("Verification failed. Please try again.");
    }
  }

  // Helper function for quick seed login
  async function handleSeedLogin(seedEmail: string) {
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
        user?: { email?: string; name?: string; role?: string };
        redirectTo?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Seed login failed.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${data.user?.name || seedEmail}. Redirecting…`);
      redirectAfterAuth(data.redirectTo);
    } catch {
      setStatus("error");
      setMessage("Seed login error. Please try again.");
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
                Welcome
              </CardTitle>
              <CardDescription className="text-base">
                {step === "email"
                  ? "Enter your email to receive a login code."
                  : "Enter the 6-digit code sent to your email."}
              </CardDescription>
            </div>
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
                  disabled={
                    status === "loading" || otp.length < 5 || timeLeft === 0
                  }
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

                <div className="flex flex-col items-center gap-3 mt-6">
                  {timeLeft > 0 ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full border border-border ">
                      <Clock className="h-3.5 w-3.5" />
                      Code expires in {formatTime(timeLeft)}
                    </div>
                  ) : (
                    <div className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                      Code expired. Please request a new one.
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm mt-2">
                    <button
                      type="button"
                      onClick={(e: any) => {
                        e.preventDefault();
                        if (timeLeft === 0) handleSendOtp(e);
                      }}
                      disabled={timeLeft > 0 || status === "loading"}
                      className={`font-medium ${timeLeft > 0 ? "text-muted-foreground cursor-not-allowed" : "text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"}`}
                    >
                      Resend code
                    </button>
                    <span className="text-slate-300 ">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setStatus("idle");
                        setMessage("");
                      }}
                      className="font-medium text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Change email
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-slate-100 flex gap-3 text-left">
                  <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground ">
                      Didn't receive the OTP? Please check your Spam or
                      Promotions folder.
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                      Email delivery can occasionally take a few moments.
                    </p>
                  </div>
                </div>
              </form>
            )}
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

        {/* Seed login section (Visible for Demo Mode) */}
        {
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 pt-6 border-t border-border/50 "
          >
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-sky-600 bg-sky-50 dark:text-sky-300 dark:bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-100 dark:border-sky-500/20 mb-3">
                Interactive Demo
              </div>
              <h3 className="text-sm font-bold tracking-widest text-muted-foreground dark:text-muted-foreground uppercase">
                DEMO CREDENTIALS
              </h3>
              <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px]">
                Click a role below to bypass email verification.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  role: "Admin",
                  email: "admin@atomicgoals.com",
                  icon: ShieldCheck,
                },
                {
                  role: "Manager",
                  email: "alice.eng@atomicgoals.com",
                  icon: UserCog,
                },
                {
                  role: "Employee",
                  email: "charlie.eng@atomicgoals.com",
                  icon: User,
                },
              ].map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleSeedLogin(cred.email)}
                  disabled={status === "loading"}
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex items-center justify-center h-11 w-11 rounded-xl border border-border/80 bg-card shadow-sm transition-all duration-300 group-hover:scale-110 dark:bg-slate-800 text-muted-foreground dark:text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30">
                      <cred.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-foreground tracking-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                        {cred.role}
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground font-medium mt-0.5">
                        {cred.email}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-center h-8 w-8 rounded-full bg-muted dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        }
      </motion.div>
    </div>
  );
}
