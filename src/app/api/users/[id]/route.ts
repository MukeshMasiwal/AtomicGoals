import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { Goal } from "@/models/Goal";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const user = await User.findById(params.id).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { role, department, team, manager, employeeStatus } =
      await req.json();

    if (
      session.role === "manager" &&
      (role !== undefined ||
        department !== undefined ||
        employeeStatus !== undefined)
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Managers can only manage team and manager assignments.",
        },
        { status: 403 },
      );
    }

    await connectDB();

    const existingUser = await User.findById(params.id)
      .select("team manager name")
      .lean<{
        team?: { toString(): string };
        manager?: { toString(): string };
        name: string;
      }>();
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (team !== undefined) {
      if (session.role === "manager") {
        const managerTeam = await Team.findOne({ manager: session.id })
          .select("_id")
          .lean<{
            _id: { toString(): string };
          }>();
        const managerTeamId = managerTeam?._id?.toString();
        const targetTeamId = team ? String(team) : null;

        if (!managerTeamId) {
          return NextResponse.json(
            { error: "Forbidden: No managed team found." },
            { status: 403 },
          );
        }

        if (targetTeamId && targetTeamId !== managerTeamId) {
          return NextResponse.json(
            { error: "Forbidden: Managers can only manage their own team." },
            { status: 403 },
          );
        }

        if (!targetTeamId && existingUser.team?.toString() !== managerTeamId) {
          return NextResponse.json(
            { error: "Forbidden: Managers can only remove members from their team." },
            { status: 403 },
          );
        }
      }

      const targetTeamId = team ? String(team) : null;
      if (targetTeamId) {
        const targetTeam = await Team.findById(targetTeamId)
          .select("members manager")
          .lean<{
            members?: Array<{ toString(): string }>;
            manager?: { toString(): string };
          }>();

        if (!targetTeam) {
          return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const memberIds = (targetTeam.members || []).map((m: any) =>
          m.toString(),
        );
        const managerId = targetTeam.manager?.toString();
        const baseCount = memberIds.length + (managerId ? 1 : 0);
        const isAlreadyMember = memberIds.includes(params.id);
        const nextCount = isAlreadyMember ? baseCount : baseCount + 1;

        if (nextCount > 8) {
          return NextResponse.json(
            { error: "Team limit reached (8/8 members)." },
            { status: 400 },
          );
        }
      }
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (team !== undefined) updateData.team = team;
    if (manager !== undefined) updateData.manager = manager;
    if (employeeStatus !== undefined)
      updateData.employeeStatus = employeeStatus;

    const user = await User.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    if (team !== undefined) {
      const prevTeamId = existingUser.team?.toString();
      const nextTeamId = team ? String(team) : null;

      if (prevTeamId && prevTeamId !== nextTeamId) {
        await Team.updateOne(
          { _id: prevTeamId },
          { $pull: { members: params.id } },
        );
      }

      if (nextTeamId) {
        await Team.updateOne(
          { _id: nextTeamId },
          { $addToSet: { members: params.id } },
        );
      }
    }

    const userNotifications: any[] = [];
    if (team !== undefined) {
      const prevTeamId = existingUser.team?.toString() || "";
      const nextTeamId = team ? String(team) : "";
      if (prevTeamId !== nextTeamId) {
        userNotifications.push({
          type: "Team Updated",
          title: "Team Assignment Updated",
          message: nextTeamId
            ? "You have been assigned to a new team."
            : "You have been removed from your team.",
          recipient: params.id,
          link: "/dashboard/team",
          relatedTeam: nextTeamId || prevTeamId || undefined,
        });
      }
    }

    if (manager !== undefined) {
      const prevManagerId = existingUser.manager?.toString() || "";
      const nextManagerId = manager ? String(manager) : "";
      if (prevManagerId !== nextManagerId) {
        userNotifications.push({
          type: "Team Updated",
          title: "Manager Assignment Updated",
          message: nextManagerId
            ? "A new manager has been assigned to you."
            : "Your manager assignment was removed.",
          recipient: params.id,
          link: "/dashboard/team",
        });

        if (nextManagerId) {
          userNotifications.push({
            type: "Team Member Added",
            title: "New Direct Report",
            message: `${user.name} now reports to you.`,
            recipient: nextManagerId,
            link: "/dashboard/team",
            relatedUser: params.id,
          });
        }
      }
    }

    // Role change notification
    if (role && role !== user.role) {
      userNotifications.push({
        type: "Team Updated",
        title: "Role Updated",
        message: `Your role has been updated to ${role} by an admin.`,
        recipient: params.id,
      });
    }

    if (userNotifications.length > 0) {
      const { createNotification, notifyAdmins } = await import("@/lib/notifications");
      for (const notif of userNotifications) {
        await createNotification(notif);
      }
      
      // Also notify admins if the user was assigned to team or manager
      if (team !== undefined || manager !== undefined) {
        await notifyAdmins({
          type: "Team Updated",
          title: `Admin: User Assignment Updated`,
          message: `${user.name} assignment was updated.`,
          link: `/dashboard/team`,
          relatedUser: params.id,
        });
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.id === params.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 },
      );
    }

    await connectDB();
    await User.findByIdAndDelete(params.id);

    // Clear related assignments
    await Team.updateMany({ manager: params.id }, { $unset: { manager: 1 } });
    await Goal.updateMany(
      { assignedTo: params.id },
      { $pull: { assignedTo: params.id } },
    );
    await Goal.updateMany(
      { assignedManager: params.id },
      { $unset: { assignedManager: 1 } },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
