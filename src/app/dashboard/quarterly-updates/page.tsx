import DashboardShell from "@/components/layout/dashboard-shell";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MessageSquare,
  TrendingUp,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuarterlyExportButton } from "@/components/dashboard/quarterly-export-button";

export default async function QuarterlyUpdatesPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const user = (await User.findById(session.id).select("department team").lean()) as any;
  const userDept = user?.department || "";
  const userTeam = user?.team || null;

  let filter: any = {};
  if (session.role === "manager") {
    filter = { department: userDept };
  } else if (session.role === "employee") {
    filter = {
      $or: [
        { creator: session.id },
        { assignedTo: session.id },
        { team: userTeam },
        { department: userDept },
      ],
    };
  }

  // Find goals that have quarterly targets or are in progress/completed
  const goals = (await Goal.find(filter)
    .populate("assignedManager", "name")
    .sort({ createdAt: -1 })
    .lean()) as any[];

  return (
    <DashboardShell
      title="Quarterly Updates"
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
              Quarterly Reviews & Check-ins
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-1">
              Review past performance, feedback, and manager comments.
            </p>
          </div>
          <QuarterlyExportButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Current Quarter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <div className="text-2xl font-bold">Q3 2026</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Review cycle ends soon
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <div className="text-2xl font-bold">
                  {goals.length > 0
                    ? Math.round(
                        goals.reduce((acc, g) => acc + (g.progress || 0), 0) /
                          goals.length,
                      )
                    : 0}
                  %
                </div>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Average goal completion
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground ">
            Quarterly Goals & Feedback
          </h3>
          <div className="relative border-l border-border ml-3 space-y-8 pb-4">
            {goals.length === 0 ? (
              <p className="pl-6 text-sm text-muted-foreground">
                No quarterly goals found.
              </p>
            ) : (
              goals.map((goal) => (
                <div key={goal._id.toString()} className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-indigo-600 bg-card " />
                  <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-xl ">
                    <CardHeader className="pb-3 flex flex-row items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                      <div>
                        <CardTitle className="text-base">
                          {goal.title}
                        </CardTitle>
                        <CardDescription>
                          Target: {goal.quarterlyTarget || "No Target Defined"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={null}
                        className={
                          goal.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }
                      >
                        {goal.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 text-sm w-full">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-700 ">
                              Progress
                            </span>
                            <span className="text-muted-foreground">
                              {goal.progress}%
                            </span>
                          </div>
                          <Progress
                            value={goal.progress || 0}
                            className="h-2"
                          />
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <div className="flex items-center gap-1.5 text-foreground/80 ">
                            <CheckCircle className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">Actual:</span>{" "}
                            {goal.actualAchievement || "Pending"}
                          </div>
                          <div className="flex items-center gap-1.5 text-foreground/80 ">
                            <UserCheck className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">Manager:</span>{" "}
                            {goal.assignedManager?.name || "Unassigned"}
                          </div>
                        </div>
                      </div>
                      {goal.approvalComments && (
                        <div className="rounded-xl bg-muted/50 p-4 text-sm text-foreground/80 flex items-start gap-3 border border-slate-100 ">
                          <MessageSquare className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-semibold block text-foreground ">
                              Manager Review Comments:
                            </span>
                            <p className="italic">"{goal.approvalComments}"</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
