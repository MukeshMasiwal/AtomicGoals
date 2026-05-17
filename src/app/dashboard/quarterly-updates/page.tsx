import DashboardShell from "@/components/layout/dashboard-shell";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, TrendingUp, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockUpdates = [
  {
    id: "Q3-2026",
    quarter: "Q3 2026",
    status: "Completed",
    score: "Exceeds Expectations",
    manager: "Jane Doe",
    date: "Oct 05, 2026",
    comments: "Excellent leadership shown during the Next.js migration project. Delivered all features ahead of schedule.",
  },
  {
    id: "Q2-2026",
    quarter: "Q2 2026",
    status: "Completed",
    score: "Meets Expectations",
    manager: "Jane Doe",
    date: "Jul 10, 2026",
    comments: "Solid performance on backend optimization. Needs to focus slightly more on cross-team communication.",
  },
];

export default async function QuarterlyUpdatesPage() {
  const session = await getSessionFromCookies();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="Quarterly Updates"
      userName={session.name || "User"}
      roleLabel={session.role === "admin" ? "Administrator" : session.role === "manager" ? "Manager" : "Employee"}
      role={session.role}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quarterly Reviews</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review past performance, feedback, and manager comments.</p>
          </div>
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            Submit Self-Review
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Quarter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <div className="text-2xl font-bold">Q4 2026</div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Review cycle starts Dec 15</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <div className="text-2xl font-bold">4.2 / 5.0</div>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+0.4 from last year</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Past Updates Timeline</h3>
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-8 pb-4">
            {mockUpdates.map((update, idx) => (
              <div key={update.id} className="relative pl-6">
                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-indigo-600 bg-white dark:bg-slate-900" />
                <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{update.quarter}</CardTitle>
                      <CardDescription>{update.date}</CardDescription>
                    </div>
                    <Badge variant={null} className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                      {update.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">Score:</span> {update.score}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <UserCheck className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">Manager:</span> {update.manager}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-600 dark:text-slate-300 flex items-start gap-3 border border-slate-100 dark:border-slate-800">
                      <MessageSquare className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="italic">"{update.comments}"</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
