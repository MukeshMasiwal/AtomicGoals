import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    let filter = {};

    if (session.role === "admin") {
      filter = {};
    } else if (session.role === "manager") {
      const teams = await Team.find({ manager: session.id }).select("_id").lean();
      const teamIds = teams.map((t) => t._id);
      
      filter = {
        $or: [
          { team: { $in: teamIds } },
          { creator: session.id },
          { assignedTo: session.id },
          { assignedManager: session.id }
        ]
      };
    } else {
      filter = {
        $or: [
          { creator: session.id },
          { assignedTo: session.id }
        ]
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
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, assignedTo, team, priority, dueDate, progress, approvalStatus, assignedManager } = await req.json();

    if (!dueDate) {
      return NextResponse.json({ error: "Due date is required" }, { status: 400 });
    }
    const parsedDueDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDueDate < today) {
      return NextResponse.json({ error: "Deadline cannot be set in the past." }, { status: 400 });
    }

    if (!assignedManager) {
      return NextResponse.json({ error: "Manager assignment is mandatory" }, { status: 400 });
    }

    await connectDB();
    
    // Only managers/admins can set approvalStatus to Approved/Rejected directly on creation
    let finalStatus = approvalStatus || "Draft";
    if (["Approved", "Rejected"].includes(finalStatus) && !["manager", "admin"].includes(session.role)) {
      finalStatus = "Pending Approval";
    }

    const goal = await Goal.create({
      title,
      description,
      creator: session.id,
      assignedTo: assignedTo || [],
      team: team || null,
      priority: priority || "Medium",
      dueDate: parsedDueDate,
      progress: progress || 0,
      approvalStatus: finalStatus,
      assignedManager,
    });

    // Notification logic
    const creatorUser = await User.findById(session.id);
    const creatorDept = creatorUser?.department || "No Department";
    
    const newNotif = {
      title: "New Task Created",
      message: `New task "${title}" [Priority: ${priority}] created by ${session.name} (${creatorDept}).`,
      type: "task_approval",
      read: false,
      createdAt: new Date(),
      link: "/dashboard/goals"
    };

    // Notify the assigned manager
    if (assignedManager !== session.id) {
      await User.updateOne(
        { _id: assignedManager },
        { $push: { notifications: { $each: [newNotif], $position: 0, $slice: 50 } } }
      );
    }

    // Notify Assigned Users if they are not the creator
    if (assignedTo && assignedTo.length > 0) {
      const assigneesToNotify = assignedTo.filter((id: string) => id !== session.id);
      if (assigneesToNotify.length > 0) {
        const assignedNotif = {
          title: "New Task Assigned",
          message: `You have been assigned to task "${title}" by ${session.name}.`,
          type: "task_assignment",
          read: false,
          createdAt: new Date(),
          link: "/dashboard/goals"
        };
        await User.updateMany(
          { _id: { $in: assigneesToNotify } },
          { $push: { notifications: { $each: [assignedNotif], $position: 0, $slice: 50 } } }
        );
      }
    }

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
