import DashboardShell from "@/components/layout/dashboard-shell";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle2, Clock } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getSessionFromCookies();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="Analytics Overview"
      userName={session.name || "User"}
      roleLabel={session.role === "admin" ? "Administrator" : session.role === "manager" ? "Manager" : "Employee"}
      role={session.role}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Organization Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track company-wide performance, completion metrics, and productivity.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+5.4% from last quarter</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 / 5.0</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Consistent with last year</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Reviews</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">8 due this week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Department Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Engineering</span>
                  <span className="text-slate-500">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Marketing</span>
                  <span className="text-slate-500">62%</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Sales</span>
                  <span className="text-slate-500">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Human Resources</span>
                  <span className="text-slate-500">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 flex flex-col justify-center items-center p-8 min-h-[300px]">
             {/* Placeholder for an actual chart component */}
             <div className="flex flex-col items-center justify-center text-center space-y-3">
               <div className="h-24 w-24 rounded-full border-8 border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center border-t-indigo-600 dark:border-t-indigo-500 transform rotate-45">
                 <div className="transform -rotate-45">
                   <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                 </div>
               </div>
               <div>
                 <h3 className="font-semibold text-slate-900 dark:text-white">Productivity Overview</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">Detailed chart visualizations will be available once the reporting module is fully integrated.</p>
               </div>
             </div>
          </Card>
        </div>

      </div>
    </DashboardShell>
  );
}
