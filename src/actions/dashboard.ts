"use server";

import { getSessionFromCookies } from "@/lib/auth";
import { getDashboardData, type Role } from "@/lib/mock-data";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
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
    const filter =
      role === "admin"
        ? {}
        : role === "manager"
          ? {
              $or: [
                { department: session.department },
                { managerEmail: session.email },
                { ownerEmail: session.email },
              ],
            }
          : {
              $or: [{ ownerId: session.id }, { ownerEmail: session.email }],
            };

    const goals = await Goal.find(filter).sort({ updatedAt: -1 }).limit(8).lean();
    const goalCount = await Goal.countDocuments(filter);

    const formattedGoals =
      goals.length > 0
        ? goals.map((goal) => ({
            id: String(goal._id),
            title: goal.title,
            status:
              goal.status === "approved"
                ? ("Approved" as const)
                : goal.status === "pending"
                  ? ("Pending" as const)
                  : goal.status === "rejected"
                    ? ("Rejected" as const)
                    : ("Draft" as const),
            weight: goal.weight ? `${goal.weight}%` : "—",
            progress: goal.progress ?? 0,
            deadline: goal.deadline
              ? new Date(goal.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—",
            approval:
              goal.status === "approved"
                ? "Approved"
                : goal.status === "pending"
                  ? "Awaiting manager"
                  : goal.status === "rejected"
                    ? "Needs revision"
                    : "Not submitted",
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
        name: session.name,
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
  } catch {
    return {
      ...mock,
      user: {
        name: session.name,
        role: session.role,
        roleLabel: roleLabel(session.role),
      },
      source: "mock" as const,
    };
  }
}
