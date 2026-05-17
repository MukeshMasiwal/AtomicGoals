import { logAudit } from "@/lib/audit";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { canAccessGoal } from "@/lib/permissions";
import { Goal } from "@/models/Goal";

type RouteContext = { params: Promise<{ id: string }> };

type GoalRecord = {
  _id: unknown;
  ownerId: unknown;
  ownerEmail: string;
  department?: string;
  managerEmail?: string;
};

function sanitizeGoal(goal: Record<string, unknown>) {
  return {
    ...goal,
    id: String(goal._id ?? ""),
    ownerId: goal.ownerId ? String(goal.ownerId) : undefined,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await connectDB();
    const goal = await Goal.findById(id).lean<GoalRecord>();
    if (!goal) {
      return Response.json({ error: "Goal not found." }, { status: 404 });
    }

    if (
      !canAccessGoal(user, {
        ownerId: String(goal.ownerId),
        ownerEmail: goal.ownerEmail,
        department: goal.department,
        managerEmail: goal.managerEmail,
      })
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json({
      goal: sanitizeGoal(goal as unknown as Record<string, unknown>),
    });
  } catch (error) {
    console.error("[goals/[id]/GET]", error);
    return Response.json({ error: "Failed to fetch goal." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await connectDB();
    const goal = await Goal.findById(id).lean<GoalRecord>();
    if (!goal) {
      return Response.json({ error: "Goal not found." }, { status: 404 });
    }

    const isOwner =
      String(goal.ownerId) === user.id || goal.ownerEmail === user.email;

    if (user.role !== "admin" && !isOwner) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await Goal.findByIdAndDelete(id);

    await logAudit({
      action: "goal.delete",
      actorEmail: user.email,
      targetType: "goal",
      targetId: id,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[goals/[id]/DELETE]", error);
    return Response.json({ error: "Failed to delete goal." }, { status: 500 });
  }
}
