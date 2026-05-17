import { logAudit } from "@/lib/audit";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { canManageUsers } from "@/lib/permissions";
import { User } from "@/models/User";
import type { Role } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageUsers(user)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    role?: Role;
    department?: string;
  };

  const updates: Record<string, unknown> = {};
  if (body.role === "employee" || body.role === "manager" || body.role === "admin") {
    updates.role = body.role;
  }
  if (typeof body.department === "string") {
    updates.department = body.department.trim();
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 });
  }

  try {
    await connectDB();
    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .select("name email role department team")
      .lean<{
        _id: unknown;
        name: string;
        email: string;
        role: string;
        department?: string;
        team?: string;
      }>();

    if (!updated) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    await logAudit({
      action: "user.update",
      actorEmail: user.email,
      targetType: "user",
      targetId: id,
      metadata: updates,
    });

    return Response.json({
      user: {
        id: String(updated._id),
        name: updated.name,
        email: updated.email,
        role: updated.role,
        department: updated.department,
        team: updated.team,
      },
    });
  } catch (error) {
    console.error("[users/[id]/PATCH]", error);
    return Response.json({ error: "Failed to update user." }, { status: 500 });
  }
}
