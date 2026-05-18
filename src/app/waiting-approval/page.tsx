"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WaitingApprovalPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/auth/refresh", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        user?: { approvalStatus?: string };
      };

      if (data.user?.approvalStatus === "Approved") {
        router.push("/dashboard");
        return;
      }

      if (data.user?.approvalStatus === "Rejected") {
        router.push("/rejected");
        return;
      }

      router.refresh();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_45%,_#f5f8ff_100%)] px-4 py-6 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden lg:flex">
            <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_24px_80px_rgba(2,6,23,0.4)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),transparent_40%,rgba(14,165,233,0.08))]" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <Logo />
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Approval in progress
                  </div>
                  <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Your account is almost ready.
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
                    We’ve preserved the existing approval workflow. Once the admin reviews your profile, access will unlock automatically.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      "Secure OTP sign-in",
                      "Managed approval queue",
                      "Role-based dashboard access",
                      "Instant status refresh",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full border-white/70 bg-white/85 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.42)]">
            <CardHeader className="space-y-5 pb-5 pt-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  Waiting for approval
                </CardTitle>
                <CardDescription className="mx-auto max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
                  Your profile has been submitted and is awaiting review from the seed admin.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 text-left shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      We will notify you when your account is approved.
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      For immediate demo access, use the demo accounts on the login page.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                You can check your approval status again at any time. If approval is complete, you will be taken directly to your dashboard.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleRefresh}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                  disabled={checking}
                >
                  {checking ? "Checking..." : "Check status again"}
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="h-12 w-full rounded-xl border-slate-300 bg-white/80 font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-900/70"
                >
                  Return to homepage
                </Button>
                <Button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/login");
                    router.refresh();
                  }}
                  variant="ghost"
                  className="h-11 w-full rounded-xl text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                >
                  Log into another account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
