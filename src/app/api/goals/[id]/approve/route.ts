import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.role === "employee") {
      return NextResponse.json({ error: "Forbidden: Employees cannot approve tasks" }, { status: 403 });
    }

    const { approvalStatus, approvalComments } = await req.json();

    if (!["Approved", "Rejected"].includes(approvalStatus)) {
      return NextResponse.json({ error: "Invalid approval status" }, { status: 400 });
    }

    await connectDB();
    
    const goal = await Goal.findById(params.id);
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    // A manager can only approve if it's assigned to their team, or admin
    // For simplicity, we just allow any manager to approve for now, but in a real app we'd verify team ownership.
    
    goal.approvalStatus = approvalStatus;
    goal.approvedBy = session.id;
    goal.approvalComments = approvalComments || "";
    
    if (approvalStatus === "Approved") {
      // If approved and it was pending, status moves to in-progress or completed depending on progress
      goal.status = goal.progress === 100 ? "completed" : "in-progress";
    } else if (approvalStatus === "Rejected") {
      goal.status = "at-risk";
    }

    await goal.save();

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Approve goal error:", error);
    return NextResponse.json({ error: "Failed to approve goal" }, { status: 500 });
  }
}
