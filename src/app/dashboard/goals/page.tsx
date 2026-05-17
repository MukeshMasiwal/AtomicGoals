import DashboardShell from "@/components/layout/dashboard-shell";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, AlertCircle, CheckCircle2, Clock, PlayCircle } from "lucide-react";

// Mock data for the goals page
const mockGoals = [
  {
    id: "GOAL-8732",
    title: "Launch Q3 Marketing Campaign",
    status: "in-progress",
    progress: 65,
    priority: "High",
    deadline: "Sep 30, 2026",
    owner: "Marketing Team",
  },
  {
    id: "GOAL-9014",
    title: "Migrate to Next.js App Router",
    status: "at-risk",
    progress: 30,
    priority: "Critical",
    deadline: "Oct 15, 2026",
    owner: "Engineering",
  },
  {
    id: "GOAL-7645",
    title: "Update Employee Onboarding Docs",
    status: "completed",
    progress: 100,
    priority: "Medium",
    deadline: "Aug 01, 2026",
    owner: "HR",
  },
  {
    id: "GOAL-9102",
    title: "Increase Test Coverage to 85%",
    status: "not-started",
    progress: 0,
    priority: "Medium",
    deadline: "Dec 01, 2026",
    owner: "Engineering",
  },
  {
    id: "GOAL-8821",
    title: "Optimize Database Queries",
    status: "in-progress",
    progress: 45,
    priority: "High",
    deadline: "Nov 15, 2026",
    owner: "Backend Team",
  }
];

function getStatusDetails(status: string) {
  switch (status) {
    case "completed":
      return { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" };
    case "in-progress":
      return { label: "In Progress", icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" };
    case "at-risk":
      return { label: "At Risk", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20" };
    case "not-started":
    default:
      return { label: "Not Started", icon: Clock, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/20" };
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "Critical":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
    case "High":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    case "Medium":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
}

export default async function GoalsPage() {
  const session = await getSessionFromCookies();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="Goals Overview"
      userName={session.name || "User"}
      roleLabel={session.role === "admin" ? "Administrator" : session.role === "manager" ? "Manager" : "Employee"}
      role={session.role}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Page Header and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">All Goals</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage, track, and create new objectives for your organization.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-slate-900 hidden sm:flex">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search goals by title, ID, or owner..." 
                className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals Data Table */}
        <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[300px] font-semibold text-slate-600 dark:text-slate-300">Goal Name</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                  <TableHead className="w-[200px] font-semibold text-slate-600 dark:text-slate-300">Progress</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Priority</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Deadline</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGoals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      No goals found. Click "Create Goal" to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  mockGoals.map((goal) => {
                    const status = getStatusDetails(goal.status);
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={goal.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {goal.title}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                              {goal.id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 pr-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-medium border ${getPriorityBadge(goal.priority)}`}>
                            {goal.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {goal.deadline}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                          {goal.owner}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

      </div>
    </DashboardShell>
  );
}
