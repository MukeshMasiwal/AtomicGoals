import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, teamId, managerId } = await req.json(); // "approve" or "reject"
    const { id } = await params;

    await connectDB();
    const userToApprove = await User.findById(id);

    if (!userToApprove) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData: any = {};
    let notification: any = null;

    if (action === "approve") {
      let finalTeamId = teamId;
      let finalManagerId = managerId;

      if (session.role === "manager") {
        const managerTeam = await Team.findOne({ manager: session.id })
          .select("_id members manager")
          .lean();
        if (!managerTeam?._id) {
          return NextResponse.json(
            { error: "No managed team found." },
            { status: 400 },
          );
        }
        finalTeamId = managerTeam._id.toString();
        finalManagerId = session.id;
      }

      if (!finalTeamId || !finalManagerId) {
        return NextResponse.json(
          { error: "Team and manager are required for approval." },
          { status: 400 },
        );
      }

      const team = await Team.findById(finalTeamId)
        .select("members manager")
        .lean();
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      const memberIds = (team.members || []).map((m: any) => m.toString());
      const managerOnTeam = team.manager?.toString();
      const baseCount = memberIds.length + (managerOnTeam ? 1 : 0);
      const isAlreadyMember = memberIds.includes(id);
      const nextCount = isAlreadyMember ? baseCount : baseCount + 1;

      if (nextCount > 8) {
        return NextResponse.json(
          { error: "Team limit reached (8/8 members)." },
          { status: 400 },
        );
      }

      updateData = {
        $set: {
          approvalStatus: "Approved",
          approvedBy: session.id,
          approvalDate: new Date(),
          team: finalTeamId,
          manager: finalManagerId,
          assignedManager: finalManagerId,
        },
      };
      
      notification = {
        type: "Employee Approved",
        title: "Application Approved",
        message: "Your account has been approved. You now have access to the dashboard.",
        recipient: id,
        link: "/dashboard",
      };
    } else if (action === "reject") {
      updateData = {
        $set: {
          approvalStatus: "Rejected"
        }
      };
      
      notification = {
        type: "Team Updated",
        title: "Application Rejected",
        message: "Your account application has been rejected.",
        recipient: id,
      };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await User.updateOne({ _id: id }, updateData);

    const { createNotification, notifyAdmins } = await import("@/lib/notifications");

    if (notification) {
      await createNotification(notification);
    }

    if (action === "approve") {
      await Team.updateOne(
        { _id: updateData.$set.team },
        { $addToSet: { members: id } },
      );

      if (updateData.$set.manager && updateData.$set.manager !== session.id) {
        await createNotification({
          type: "Team Member Added",
          title: "New Team Member Approved",
          message: `${userToApprove.name} has been approved and added to your team.`,
          recipient: updateData.$set.manager,
          link: "/dashboard/team",
          relatedUser: id,
        });
      }

      await notifyAdmins({
        type: "Employee Approved",
        title: "Employee Approved",
        message: `${userToApprove.name} has been approved by ${session.name}.`,
        link: "/dashboard/team",
        relatedUser: id,
      });
    }
    return NextResponse.json({ success: true, status: action === "approve" ? "Approved" : "Rejected" });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}
