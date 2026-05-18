import DashboardShell from "@/components/layout/dashboard-shell";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle2, Clock } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  await connectDB();
  const dbUser = (await User.findById(session.id)
    .select("department team")
    .lean()) as any;
  const userDept = dbUser?.department || "";
  const userTeam = dbUser?.team || null;

  // Determine query scope
  let goalFilter: any = {};
  if (session.role === "manager") {
    goalFilter = { department: userDept };
  } else if (session.role === "employee") {
    goalFilter = {
      $or: [
        { creator: session.id },
        { assignedTo: session.id },
        { team: userTeam },
        { department: userDept },
      ],
    };
  }

  const goals = await Goal.find(goalFilter).lean();

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const activeGoals = goals.filter((g) => g.status === "in-progress").length;
  const overdueGoals = goals.filter(
    (g) => g.status !== "completed" && new Date(g.dueDate) < new Date(),
  ).length;
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  let avgProgress = 0;
  if (totalGoals > 0) {
    avgProgress = Math.round(
      goals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalGoals,
    );
  }

  return (
    <DashboardShell
      title="Analytics Overview"
      userName={session.name || "User"}
      roleLabel={
        session.role === "admin"
          ? "Administrator"
          : session.role === "manager"
            ? "Manager"
            : "Employee"
      }
      role={session.role}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground ">
              {session.role === "admin"
                ? "Organization Analytics"
                : session.role === "manager"
                  ? "Department Analytics"
                  : "Personal Analytics"}
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-1">
              Track performance, completion metrics, and productivity.
            </p>
          </div>
          {(session.role === "admin" || session.role === "manager") && (
            <a
              href="/api/export"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2"
            >
              Export CSV Report
            </a>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Total Goals
              </CardTitle>
              <Target className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total accessible goals
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Completion Rate
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedGoals} goals completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Avg. Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProgress}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average progress across all goals
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Action Required
              </CardTitle>
              <Clock className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueGoals}</div>
              <p className="text-xs text-rose-500 mt-1">Overdue goals</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-xl ">
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 ">
                    Active Goals
                  </span>
                  <span className="text-muted-foreground">{activeGoals}</span>
                </div>
                <Progress
                  value={totalGoals > 0 ? (activeGoals / totalGoals) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 ">
                    Completed Goals
                  </span>
                  <span className="text-muted-foreground">
                    {completedGoals}
                  </span>
                </div>
                <Progress
                  value={
                    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
                  }
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 ">
                    Overdue Goals
                  </span>
                  <span className="text-muted-foreground">{overdueGoals}</span>
                </div>
                <Progress
                  value={totalGoals > 0 ? (overdueGoals / totalGoals) * 100 : 0}
                  className="h-2 text-rose-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-xl flex flex-col justify-center items-center p-8 min-h-[300px]">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-24 w-24 rounded-full border-8 border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center border-t-indigo-600 dark:border-t-indigo-500 transform rotate-45">
                <div className="transform -rotate-45">
                  <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground ">
                  Analytics Active
                </h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1 max-w-xs">
                  Data is live and reflects actual platform usage based on your{" "}
                  {session.role} permissions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
