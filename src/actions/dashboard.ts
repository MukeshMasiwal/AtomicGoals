"use server";

import { getSessionFromCookies } from "@/lib/auth";
import { calculateWeightedProgress, normalizeGoalForResponse } from "@/lib/goal-enterprise";
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
    const dbUser = (await User.findById(session.id).lean()) as any;
    if (!dbUser) throw new Error("User not found");

    let filter: any = {};

    if (role === "admin") {
      filter = {};
    } else if (role === "manager") {
      const teams = await Team.find({ manager: session.id })
        .select("_id")
        .lean();
      const teamIds = teams.map((t) => t._id);

      filter = {
        $or: [
          { team: { $in: teamIds } },
          { creator: session.id },
          { assignedTo: session.id },
        ],
      };
    } else {
      filter = {
        $or: [
          { creator: session.id },
          { assignedTo: session.id },
          ...(dbUser.team ? [{ team: dbUser.team }] : []),
        ],
      };
    }

    const goals = await Goal.find(filter)
      .populate("creator", "name avatar")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();
    const normalizedGoals = goals.map((goal) => normalizeGoalForResponse(goal as any));
    const goalCount = await Goal.countDocuments(filter);

    const formattedGoals =
      normalizedGoals.length > 0
        ? normalizedGoals.map((goal) => ({
            id: String(goal._id),
            title: goal.title || "Untitled Goal",
            status:
              goal.approvalStatus === "Approved"
                ? ("Approved" as const)
                : goal.approvalStatus === "Pending Approval"
                  ? ("Pending" as const)
                  : goal.approvalStatus === "Rejected"
                    ? ("Rejected" as const)
                    : ("Draft" as const),
            weight: `${goal.effectiveGoalWeightage ?? goal.goalWeightage ?? 10}%`,
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
      normalizedGoals.length > 0
        ? calculateWeightedProgress(normalizedGoals).weightedProgress
        : mock.progress;

    // Build pending actions from Pending Approval goals
    const pendingApprovalGoals = await Goal.find({
      ...filter,
      approvalStatus: "Pending Approval",
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    const dbPendingActions = pendingApprovalGoals.map((g) => ({
      id: String(g._id),
      title: "Goal Approval Required",
      description: `"${g.title}" is waiting for approval.`,
      icon: "goals" as const,
      tone: "amber" as const,
      cta: "Review Goal",
    }));

    // Build activity feed from recent goals
    const dbActivityFeed = goals.slice(0, 5).map((g: any) => ({
      id: String(g._id),
      title: "Goal Updated",
      description: `"${g.title}" was recently updated.`,
      time: g.updatedAt
        ? new Date(g.updatedAt).toLocaleDateString()
        : "Recently",
      actor: g.creator?.name || "System",
      initials: (g.creator?.name || "SY").substring(0, 2).toUpperCase(),
      type: "edited" as const,
    }));

    const approvedCount = await Goal.countDocuments({ ...filter, approvalStatus: "Approved" });
    const pendingCount = await Goal.countDocuments({ ...filter, approvalStatus: "Pending Approval" });
    const rejectedCount = await Goal.countDocuments({ ...filter, approvalStatus: "Rejected" });

    const checkinCompletedCount = await Goal.countDocuments({ ...filter, quarterlyStatus: { $ne: "not-started" } });
    const pendingCheckinCount = await Goal.countDocuments({ ...filter, quarterlyStatus: "not-started" });
    const managerReviewedCount = await Goal.countDocuments({ ...filter, approvalComments: { $exists: true, $ne: "" } });

    let dynamicKpis = mock.kpis;
    if (role === "employee") {
      dynamicKpis = [
        { label: "Total Goals", value: goalCount, trend: "", tone: "up" },
        { label: "Goals Approved", value: approvedCount, trend: "", tone: "up" },
        { label: "Pending Check-ins", value: pendingCheckinCount, trend: "", tone: "down" },
        { label: "Quarterly Score", value: (goals.reduce((acc, g: any) => acc + (g.score || 0), 0) / (goalCount || 1)).toFixed(1), trend: "", tone: "up" },
      ];
    } else {
      dynamicKpis = [
        { label: "Check-ins Complete", value: checkinCompletedCount, trend: `${Math.round((checkinCompletedCount / (goalCount || 1)) * 100)}% dept`, tone: "up" },
        { label: "Pending Reviews", value: pendingCheckinCount, trend: "", tone: "down" },
        { label: "Manager Reviewed", value: managerReviewedCount, trend: "", tone: "up" },
      ];
    }

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
      kpis: dynamicKpis,
      pendingActions:
        normalizedGoals.length > 0 ? dbPendingActions : mock.pendingActions,
      activityFeed:
        normalizedGoals.length > 0 ? dbActivityFeed : mock.activityFeed,
      source: normalizedGoals.length > 0 ? ("database" as const) : ("mock" as const),
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
