"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, UserCog, User, Clock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    const emailFromQuery = new URLSearchParams(window.location.search).get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, []);

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
        requiresSignup?: boolean;
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

  const demoAccounts = [
    {
      role: "Admin",
      email: "admin@atomicgoals.com",
      icon: ShieldCheck,
      tone: "from-indigo-500/10 to-sky-500/10",
    },
    {
      role: "Manager",
      email: "alice.eng@atomicgoals.com",
      icon: UserCog,
      tone: "from-emerald-500/10 to-teal-500/10",
    },
    {
      role: "Employee",
      email: "charlie.eng@atomicgoals.com",
      icon: User,
      tone: "from-amber-500/10 to-orange-500/10",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_42%,_#f5f8ff_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid w-full gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-6"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),transparent_36%,rgba(14,165,233,0.06))]" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <Logo />
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:text-white"
                >
                  <Home className="h-3.5 w-3.5" />
                  Home
                </Link>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                  Enterprise Goal Management
                </h1>
                <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Sign in with email OTP to continue.
                </p>
              </div>

              <Card className="border border-white/70 bg-white/85 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_14px_40px_rgba(2,6,23,0.36)]">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-xl font-semibold text-slate-950 dark:text-white">
                    {step === "email" ? "Email login" : "Enter code"}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                    {step === "email"
                      ? "Enter your email to receive a login code."
                      : `Code expires in ${formatTime(timeLeft)}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {status === "error" && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                      {message}
                    </div>
                  )}
                  {status === "success" && message && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                      {message}
                    </div>
                  )}

                  {step === "email" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Email address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12 border-slate-200 bg-white/90 text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
                          disabled={status === "loading"}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                        disabled={status === "loading" || !email}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending code...
                          </>
                        ) : (
                          <>
                            Send Login Code
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Login code
                        </Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          className="h-12 bg-white/90 text-center text-lg tracking-[0.32em] text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
                          maxLength={6}
                          disabled={status === "loading"}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                        disabled={status === "loading" || otp.length < 5 || timeLeft === 0}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify & Login
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5" />
                          {timeLeft > 0 ? formatTime(timeLeft) : "Expired"}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStep("email");
                            setStatus("idle");
                            setMessage("");
                            setOtp("");
                          }}
                          className="font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          Change email
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={(e) => {
                            if (timeLeft === 0) handleSendOtp(e as unknown as React.FormEvent<HTMLFormElement>);
                          }}
                          disabled={timeLeft > 0 || status === "loading"}
                          className={`font-medium transition-colors ${timeLeft > 0 ? "cursor-not-allowed text-slate-400" : "text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"}`}
                        >
                          Resend code
                        </button>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Check spam or promotions if needed.
                        </span>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.04 }}
            className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 dark:shadow-[0_20px_70px_rgba(2,6,23,0.42)] sm:p-6"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),transparent_34%,rgba(99,102,241,0.06))]" />
            <div className="relative z-10 space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Quick Demo Access
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Click a role to seed login instantly.
                </p>
              </div>

              <div className="grid gap-3">
                {demoAccounts.map((cred) => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => handleSeedLogin(cred.email)}
                    disabled={status === "loading"}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${cred.tone} p-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_16px_30px_rgba(15,23,42,0.12)] dark:border-slate-800/80 dark:hover:border-indigo-500/40 ${status === "loading" ? "opacity-70" : ""}`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.25),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:bg-slate-950/70">
                          <cred.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{cred.role}</div>
                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{cred.email}</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
