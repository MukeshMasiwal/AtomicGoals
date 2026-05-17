import { logAudit } from "@/lib/audit";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { canAccessGoal, getGoalsFilter } from "@/lib/permissions";
import { Goal } from "@/models/Goal";

type CreateGoalBody = {
  title?: string;
  description?: string;
  weight?: number;
  progress?: number;
  deadline?: string;
  status?: string;
};

function sanitizeGoal(goal: Record<string, unknown>) {
  const { ownerId, ownerEmail, department, managerEmail, ...rest } = goal;
  return {
    ...rest,
    id: String(goal._id ?? ""),
    ownerId: ownerId ? String(ownerId) : undefined,
    ownerEmail,
    department,
    managerEmail,
  };
}

export async function GET() {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const filter = getGoalsFilter(user);
    const goals = await Goal.find(filter).sort({ updatedAt: -1 }).lean();

    return Response.json({
      goals: goals.map((goal) => sanitizeGoal(goal as Record<string, unknown>)),
    });
  } catch (error) {
    console.error("[goals/GET]", error);
    return Response.json({ error: "Failed to fetch goals." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateGoalBody;
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return Response.json({ error: "Title is required." }, { status: 400 });
  }

  const status =
    body.status === "pending" ||
    body.status === "approved" ||
    body.status === "rejected"
      ? body.status
      : "draft";

  try {
    await connectDB();

    const goal = await Goal.create({
      title,
      description:
        typeof body.description === "string" ? body.description.trim() : "",
      weight: typeof body.weight === "number" ? body.weight : 0,
      progress: typeof body.progress === "number" ? body.progress : 0,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      status,
      ownerId: user.id,
      ownerEmail: user.email,
      department: user.department,
      managerEmail: user.role === "manager" ? user.email : "",
    });

    await logAudit({
      action: "goal.create",
      actorEmail: user.email,
      targetType: "goal",
      targetId: String(goal._id),
      metadata: { title: goal.title },
    });

    return Response.json(
      { goal: sanitizeGoal(goal.toObject() as Record<string, unknown>) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[goals/POST]", error);
    return Response.json({ error: "Failed to create goal." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    title?: string;
    status?: string;
    progress?: number;
    weight?: number;
  };

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return Response.json({ error: "Goal id is required." }, { status: 400 });
  }

  try {
    await connectDB();
    const goal = await Goal.findById(id).lean<{
      ownerId: unknown;
      ownerEmail: string;
      department?: string;
      managerEmail?: string;
    }>();
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

    const updates: Record<string, unknown> = {};
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.progress === "number") updates.progress = body.progress;
    if (typeof body.weight === "number") updates.weight = body.weight;

    if (user.role === "manager" || user.role === "admin") {
      if (
        body.status === "draft" ||
        body.status === "pending" ||
        body.status === "approved" ||
        body.status === "rejected"
      ) {
        updates.status = body.status;
      }
    } else if (body.status === "draft" || body.status === "pending") {
      updates.status = body.status;
    }

    const updated = await Goal.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();

    await logAudit({
      action: "goal.update",
      actorEmail: user.email,
      targetType: "goal",
      targetId: id,
    });

    return Response.json({
      goal: sanitizeGoal(updated as Record<string, unknown>),
    });
  } catch (error) {
    console.error("[goals/PATCH]", error);
    return Response.json({ error: "Failed to update goal." }, { status: 500 });
  }
}
