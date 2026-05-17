"use server";

import { getSessionFromCookies } from "@/lib/auth";
import { getDashboardData, type Role } from "@/lib/mock-data";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { roleLabel } from "@/utils/roles";

export async function fetchDashboardData() {
  const session = await getSessionFromCookies();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const role = session.role as Role;
  const mock = getDashboardData(role, session.name);

  try {
    await connectDB();
    const dbUser = await User.findById(session.id).lean() as any;
    if (!dbUser) throw new Error("User not found");

    let filter: any = {};

    if (role === "admin") {
      filter = {};
    } else if (role === "manager") {
      const teams = await Team.find({ manager: session.id }).select("_id").lean();
      const teamIds = teams.map((t) => t._id);
      
      filter = {
        $or: [
          { team: { $in: teamIds } },
          { creator: session.id },
          { assignedTo: session.id }
        ]
      };
    } else {
      filter = {
        $or: [
          { creator: session.id },
          { assignedTo: session.id },
          ...(dbUser.team ? [{ team: dbUser.team }] : [])
        ]
      };
    }

    const goals = await Goal.find(filter).sort({ updatedAt: -1 }).limit(8).lean();
    const goalCount = await Goal.countDocuments(filter);

    const formattedGoals =
      goals.length > 0
        ? goals.map((goal) => ({
            id: String(goal._id),
            title: goal.title,
            status:
              goal.approvalStatus === "Approved"
                ? ("Approved" as const)
                : goal.approvalStatus === "Pending Approval"
                  ? ("Pending" as const)
                  : goal.approvalStatus === "Rejected"
                    ? ("Rejected" as const)
                    : ("Draft" as const),
            weight: goal.priority || "Medium",
            progress: goal.progress ?? 0,
            deadline: goal.dueDate
              ? new Date(goal.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—",
            approval: goal.approvalStatus || "Draft",
          }))
        : mock.goals;

    const avgProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, goal) => sum + (goal.progress ?? 0), 0) / goals.length
          )
        : mock.progress;

    return {
      ...mock,
      user: {
        name: dbUser.name || session.name,
        avatar: dbUser.avatar || "",
        role: session.role,
        roleLabel: roleLabel(session.role),
      },
      goals: formattedGoals,
      progress: avgProgress,
      kpis: mock.kpis.map((kpi, index) =>
        index === 0 && typeof kpi.value === "number"
          ? { ...kpi, value: goalCount }
          : kpi
      ),
      source: goals.length > 0 ? ("database" as const) : ("mock" as const),
    };
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return {
      ...mock,
      user: {
        name: session.name,
        role: session.role,
        roleLabel: roleLabel(session.role),
        avatar: "",
      },
      source: "mock" as const,
    };
  }
}
