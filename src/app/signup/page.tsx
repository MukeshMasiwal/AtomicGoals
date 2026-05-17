"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name || !email || !password) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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
      setMessage(`Welcome, ${data.user?.name || email}. Redirecting…`);
      router.push("/dashboard");
    } catch {
      setStatus("error");
      setMessage("Signup failed. Please try again.");
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-transparent"
                  disabled={status === "loading"}
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-transparent"
                  disabled={status === "loading"}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2" 
                disabled={status === "loading" || !name || !email || !password}
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
            <div className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
                Log in
              </Link>
            </div>
          </CardContent>

          <CardFooter className="pt-2 text-center text-sm flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Link href="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              Back to home
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
