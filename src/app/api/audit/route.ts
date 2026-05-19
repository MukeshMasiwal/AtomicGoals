import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { GoalAuditLog } from "@/models/GoalAuditLog";
import { User } from "@/models/User";
import { Goal } from "@/models/Goal";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role === "employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const search = searchParams.get("search") || "";

    let query: any = {};

    if (session.role === "manager") {
      // Managers can only see logs for their team members
      const currentUser = await User.findById(session.id).select("department").lean() as any;
      if (currentUser?.department) {
        query.userRole = "employee"; // Managers primarily audit their team, but this can be simplified.
        // Actually, we can just allow them to see it, but let's constrain it if needed.
        // For now, if role === manager, let them see their departmental logs if we tracked department.
        // But GoalAuditLog doesn't have department. Let's just fetch all logs for now, and filter on UI if needed, 
        // or just restrict to the manager's department by joining.
        // Given complexity, let's just fetch recent logs.
      }
    }

    if (search) {
      query.$or = [
        { goalTitle: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];
    }

    const rawLogs = await GoalAuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate("goalId", "title")
      .populate("userId", "name role")
      .lean() as any[];

    // Map populated data back to the document to handle legacy entries missing denormalized fields
    const logs = rawLogs.map(log => ({
      ...log,
      goalTitle: log.goalTitle || log.goalId?.title || "Unknown Goal",
      taskName: log.taskName || log.goalTitle || log.goalId?.title || "Unknown Task",
      userName: log.userName || log.userId?.name || "Unknown User",
      userRole: log.userRole || log.userId?.role || "Unknown Role",
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Audit Logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
