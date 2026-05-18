import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { User } from "@/models/User";
import { sendMail } from "@/lib/mail";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.role === "employee") {
      return NextResponse.json(
        { error: "Forbidden: Employees cannot approve tasks" },
        { status: 403 },
      );
    }

    const { approvalStatus, approvalComments } = await req.json();

    if (!["Approved", "Rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        { error: "Invalid approval status" },
        { status: 400 },
      );
    }

    await connectDB();

    const goal = await Goal.findById(params.id);
    if (!goal)
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    // Managers cannot approve goals created by managers or admins
    const creatorUser = await User.findById(goal.creator);
    if (
      session.role === "manager" &&
      (creatorUser?.role === "admin")
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Managers cannot approve goals created by admins",
        },
        { status: 403 },
      );
    }

    // A manager can only approve goals where they are the assigned manager
    if (session.role === "manager" && goal.assignedManager?.toString() !== session.id) {
       return NextResponse.json(
        {
          error:
            "Forbidden: Managers can only approve goals assigned to them",
        },
        { status: 403 },
      );
    }

    goal.approvalStatus = approvalStatus;
    goal.approvedBy = session.id;
    goal.approvalComments = approvalComments || "";

    if (approvalStatus === "Approved") {
      // If approved and it was pending, status moves to in-progress or completed depending on progress
      goal.status = goal.progress === 100 ? "completed" : "in-progress";
    } else if (approvalStatus === "Rejected") {
      goal.status = "at-risk";
    }

    await Goal.updateOne(
      { _id: goal._id },
      {
        $set: {
          approvalStatus: goal.approvalStatus,
          approvedBy: goal.approvedBy,
          approvalComments: goal.approvalComments,
          status: goal.status,
        },
      }
    );

    // Send notifications to creator
    if (creatorUser) {
      const statusText = approvalStatus.toLowerCase();
      // In-app notification
      await User.updateOne(
        { _id: creatorUser._id },
        {
          $push: {
             notifications: {
              title: `Goal ${approvalStatus}`,
              message: `Your goal "${goal.title}" has been ${statusText} by your manager.`,
              type: "goal_approval",
              link: `/dashboard/goals?selected=${goal._id}`
            }
          }
        }
      );

      // Email notification
      if (creatorUser.email) {
        await sendMail({
          to: creatorUser.email,
          subject: `Your goal has been ${statusText}`,
          html: `<p>Hi ${creatorUser.name || creatorUser.firstName},</p>
                 <p>Your goal <strong>${goal.title}</strong> has been ${statusText}.</p>
                 ${approvalComments ? `<p><strong>Comments:</strong> ${approvalComments}</p>` : ""}
                 <p>Log in to your dashboard to view more details.</p>`
        });
      }
    }

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Approve goal error:", error);
    return NextResponse.json(
      { error: "Failed to approve goal" },
      { status: 500 },
    );
  }
}
