"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useRouter } from "next/navigation";

export default function RejectedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="mb-8">
        <Logo className="w-48" />
      </div>
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 text-center">
        <CardHeader className="space-y-4 pb-6">
          <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
            Your application was not approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            If you believe this is an error, please contact your administrator.
          </p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleLogout}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
            >
              Sign out
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Return to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
