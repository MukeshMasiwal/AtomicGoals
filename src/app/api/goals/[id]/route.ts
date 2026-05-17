import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates = await req.json();

    await connectDB();
    
    const goal = await Goal.findById(params.id);
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    if (updates.dueDate) {
      const parsedDueDate = new Date(updates.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDueDate < today) {
        return NextResponse.json({ error: "Deadline cannot be set in the past." }, { status: 400 });
      }
      updates.dueDate = parsedDueDate;
    }

    // Allow creator or admin/manager to edit
    if (goal.creator.toString() !== session.id && session.role === "employee") {
      // Check if assigned
      if (!goal.assignedTo.map(String).includes(session.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Employees cannot change approval status
    if (session.role === "employee") {
      delete updates.approvalStatus;
      delete updates.approvedBy;
      delete updates.approvalComments;
    }

    Object.assign(goal, updates);
    await goal.save();

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const goal = await Goal.findById(params.id);
    
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    if (goal.creator.toString() !== session.id && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await goal.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
