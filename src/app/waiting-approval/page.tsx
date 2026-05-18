"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="mb-8">
        <Logo className="w-48" />
      </div>
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 text-center">
        <CardHeader className="space-y-4 pb-6">
          <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Waiting for Approval</CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
            Please ask the seed admin to approve your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            You will gain access once your application is reviewed. We will notify you when your account is ready.
          </p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleRefresh}
              className="w-full font-semibold"
              disabled={checking}
            >
              {checking ? "Checking..." : "Check Status Again"}
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Return to Homepage
            </Button>
            <Button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Log into another account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
