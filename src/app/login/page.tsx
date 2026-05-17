"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, UserCog, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
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

  const redirectBasedOnRole = (role?: string) => {
    switch (role) {
      case "admin":
        router.push("/admin");
        break;
      case "manager":
        router.push("/manager");
        break;
      case "employee":
        router.push("/employee");
        break;
      default:
        router.push("/dashboard");
    }
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
        user?: { email?: string; name?: string; role?: string };
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Invalid login code.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${data.user?.name || email}. Redirecting…`);
      
      // Perform immediate redirect based on role
      redirectBasedOnRole(data.user?.role);
    } catch {
      setStatus("error");
      setMessage("Verification failed. Please try again.");
    }
  }

  // Development-only helper function for quick seed login
  async function handleSeedLogin(seedEmail: string) {
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
        user?: { email?: string; name?: string; role?: string };
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Seed login failed.");
        return;
      }

      setStatus("success");
      setMessage(`Welcome, ${data.user?.name || seedEmail}. Redirecting…`);
      
      // Perform immediate redirect based on role
      redirectBasedOnRole(data.user?.role);
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
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20 mb-3">
                <AlertTriangle className="h-3 w-3" />
                Development Only
              </div>
              <h3 className="text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">DEMO CREDENTIALS</h3>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { role: "Admin", email: "admin@ihgst.com", icon: ShieldCheck },
                { role: "Manager", email: "manager@ihgst.com", icon: UserCog },
                { role: "Employee1", email: "employee1@ihgst.com", icon: User }
              ].map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleSeedLogin(cred.email)}
                  disabled={status === "loading"}
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex items-center justify-center h-11 w-11 rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 group-hover:scale-110 dark:border-slate-700/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30">
                      <cred.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                        {cred.role}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {cred.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
