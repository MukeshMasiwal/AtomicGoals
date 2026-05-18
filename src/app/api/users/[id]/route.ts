import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { Goal } from "@/models/Goal";

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

    // Add notification to the user about role change
    if (role && role !== user.role) {
      await User.updateOne(
        { _id: params.id },
        {
          $push: {
            notifications: {
              $each: [
                {
                  title: "Role Updated",
                  message: `Your role has been updated to ${role} by an admin.`,
                  read: false,
                  createdAt: new Date(),
                },
              ],
              $position: 0,
              $slice: 50,
            },
          },
        },
      );
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
