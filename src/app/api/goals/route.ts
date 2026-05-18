import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    let filter = {};

    const user = (await User.findById(session.id)
      .select("department team")
      .lean()) as any;
    const userDept = user?.department || "";
    const userTeam = user?.team || null;

    if (session.role === "admin") {
      filter = {};
    } else if (session.role === "manager") {
      filter = {
        $or: [
          { department: userDept },
          { creator: session.id },
          { assignedTo: session.id },
          { assignedManager: session.id },
        ],
      };
    } else {
      filter = {
        $or: [
          { creator: session.id },
          { assignedTo: session.id },
          { team: userTeam },
          { department: userDept },
        ],
      };
    }

    const goals = await Goal.find(filter)
      .populate("creator", "name avatar")
      .populate("assignedTo", "name avatar")
      .populate("team", "name")
      .populate("approvedBy", "name")
      .populate("assignedManager", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Fetch goals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      title,
      description,
      assignedTo,
      team,
      priority,
      dueDate,
      progress,
      approvalStatus,
      assignedManager,
      numberOfTasks,
    } = await req.json();

    if (!dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 },
      );
    }
    const parsedDueDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDueDate < today) {
      return NextResponse.json(
        { error: "Deadline cannot be set in the past." },
        { status: 400 },
      );
    }

    if (!assignedManager) {
      return NextResponse.json(
        { error: "Manager assignment is mandatory" },
        { status: 400 },
      );
    }

    if (numberOfTasks && numberOfTasks < 1) {
      return NextResponse.json(
        { error: "Number of tasks must be positive" },
        { status: 400 },
      );
    }

    await connectDB();

    // Approval logic based on roles
    let finalStatus =
      approvalStatus || (session.role === "admin" ? "Approved" : "Pending Approval");

    if (["Approved", "Rejected"].includes(finalStatus)) {
      if (session.role === "employee") {
        finalStatus = "Pending Approval"; // Employee goals need Manager/Admin approval
      } else if (session.role === "manager") {
        finalStatus = "Pending Approval"; // Manager goals need Admin approval
      } else if (session.role === "admin") {
        // Admin goals auto-approved or keep whatever they selected
      }
    }

    const payload: any = {
      title,
      description,
      creator: session.id,
      assignedTo: assignedTo || [],
      priority: priority || "Medium",
      dueDate: parsedDueDate,
      progress: progress || 0,
      numberOfTasks: numberOfTasks || 1,
      approvalStatus: finalStatus,
      assignedManager,
    };
    if (team) {
      payload.team = team;
    }

    const goal = await Goal.create(payload);

    // Notification logic
    const creatorUser = await User.findById(session.id);
    const creatorDept = creatorUser?.department || "No Department";

    const { createNotification, notifyAdmins } = await import("@/lib/notifications");

    const newNotifBase = {
      title: "New Task Created",
      message: `New task "${title}" [Priority: ${priority}] created by ${session.name} (${creatorDept}).`,
      type: "Goal Created" as any, // mapping to Goal Created
      link: "/dashboard/goals",
      relatedGoal: goal._id.toString(),
    };

    // Notify the assigned manager
    if (assignedManager && assignedManager !== session.id) {
      await createNotification({
        ...newNotifBase,
        recipient: assignedManager,
      });
    }

    // Notify all admins
    await notifyAdmins(newNotifBase);

    // Notify Assigned Users if they are not the creator
    if (assignedTo && assignedTo.length > 0) {
      const assigneesToNotify = assignedTo.filter(
        (id: string) => id !== session.id,
      );
      if (assigneesToNotify.length > 0) {
        for (const assignee of assigneesToNotify) {
          await createNotification({
            title: "New Task Assigned",
            message: `You have been assigned to task "${title}" by ${session.name}.`,
            type: "Goal Created" as any,
            recipient: assignee,
            link: "/dashboard/goals",
            relatedGoal: goal._id.toString(),
          });
        }
      }
    }

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 },
    );
  }
}
