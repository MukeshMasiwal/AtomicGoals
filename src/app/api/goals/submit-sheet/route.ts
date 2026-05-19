import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { resolveEnterpriseGoalWeights } from "@/lib/goal-enterprise";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "employee") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const activeGoals = await Goal.find({
      creator: session.id,
      approvalStatus: { $ne: "Rejected" },
      status: { $ne: "completed" }
    });

    const validation = resolveEnterpriseGoalWeights(activeGoals);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (validation.totalWeightage !== 100) {
      return NextResponse.json({ error: "Total goal weightage must equal 100% to submit." }, { status: 400 });
    }

    const draftGoals = activeGoals.filter(g => g.approvalStatus === "Draft");
    
    if (draftGoals.length === 0) {
      return NextResponse.json({ error: "No draft goals to submit." }, { status: 400 });
    }

    // Update all draft goals to Pending Approval
    const draftGoalIds = draftGoals.map(g => g._id);
    await Goal.updateMany(
      { _id: { $in: draftGoalIds } },
      { $set: { approvalStatus: "Pending Approval" } }
    );

    // Notify managers
    const { createNotification } = await import("@/lib/notifications");
    
    // We notify the assigned managers of the submitted goals
    const managerIds = [...new Set(draftGoals.map(g => String(g.assignedManager)))];
    
    for (const managerId of managerIds) {
      if (managerId) {
        await createNotification({
          type: "Goal Created",
          title: "Goal Sheet Submitted",
          message: `${session.name} has submitted their Goal Sheet for approval.`,
          recipient: managerId,
          link: "/dashboard/goals",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit Goal Sheet error:", error);
    return NextResponse.json(
      { error: "Failed to submit goal sheet." },
      { status: 500 }
    );
  }
}
