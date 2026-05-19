import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { GoalAuditLog } from "@/models/GoalAuditLog";
import { getQuarterlyWindowInfo, calculateKPIScore } from "@/lib/quarterly";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates = await req.json();
    await connectDB();

    const goal = await Goal.findById(params.id);
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    const windowInfo = getQuarterlyWindowInfo();
    
    const isAdmin = session.role === "admin";
    
    if (!windowInfo.isOpen && !isAdmin) {
      return NextResponse.json({ error: "Quarterly check-in window is currently closed. Admin override required." }, { status: 403 });
    }

    // Validation
    if (updates.plannedTargetValue !== undefined && updates.plannedTargetValue !== null && updates.plannedTargetValue < 0) {
      return NextResponse.json({ error: "Planned Target cannot be negative." }, { status: 400 });
    }
    if (updates.actualAchievementValue !== undefined && updates.actualAchievementValue !== null && updates.actualAchievementValue < 0) {
      return NextResponse.json({ error: "Actual Achievement cannot be negative." }, { status: 400 });
    }
    if (updates.tasksCompleted !== undefined && updates.tasksCompleted !== null) {
      if (updates.tasksCompleted < 0) {
        return NextResponse.json({ error: "Completed tasks cannot be negative." }, { status: 400 });
      }
      const safeTotalTasksForValidation = Math.max(1, Number(goal.numberOfTasks) || 1);
      if (updates.tasksCompleted > safeTotalTasksForValidation) {
        return NextResponse.json({ error: "Completed tasks cannot exceed total tasks." }, { status: 400 });
      }
    }

    const changes: any[] = [];
    
    // Employee updates
    if (updates.plannedTargetValue !== undefined && updates.plannedTargetValue !== goal.plannedTargetValue) {
      changes.push({ field: "plannedTargetValue", oldValue: goal.plannedTargetValue, newValue: updates.plannedTargetValue });
      goal.plannedTargetValue = updates.plannedTargetValue;
    }
    
    if (updates.actualAchievementValue !== undefined && updates.actualAchievementValue !== goal.actualAchievementValue) {
      changes.push({ field: "actualAchievementValue", oldValue: goal.actualAchievementValue, newValue: updates.actualAchievementValue });
      goal.actualAchievementValue = updates.actualAchievementValue;
    }
    
    if (updates.quarterlyStatus !== undefined && updates.quarterlyStatus !== goal.quarterlyStatus) {
      changes.push({ field: "quarterlyStatus", oldValue: goal.quarterlyStatus, newValue: updates.quarterlyStatus });
      goal.quarterlyStatus = updates.quarterlyStatus;
    }
    
    if (updates.tasksCompleted !== undefined && updates.tasksCompleted !== goal.tasksCompleted) {
      changes.push({ field: "tasksCompleted", oldValue: goal.tasksCompleted, newValue: updates.tasksCompleted });
      goal.tasksCompleted = updates.tasksCompleted;
      
      const safeTotalTasks = Math.max(1, Number(goal.numberOfTasks) || 1);
      const newProgress = Math.round((goal.tasksCompleted / safeTotalTasks) * 100);
      if (newProgress !== goal.progress) {
        changes.push({ field: "progress", oldValue: goal.progress, newValue: newProgress });
        goal.progress = newProgress;
      }
    } else if (updates.progress !== undefined && updates.progress !== goal.progress) {
      // Fallback for older components updating progress directly
      changes.push({ field: "progress", oldValue: goal.progress, newValue: updates.progress });
      goal.progress = updates.progress;
    }

    // Calculate KPI Score if target/actual changed
    const newScore = calculateKPIScore(
      goal.kpiType || "min",
      goal.plannedTargetValue,
      goal.actualAchievementValue,
      goal.dueDate,
      goal.completionDate
    );
    
    if (newScore !== goal.score) {
      changes.push({ field: "score", oldValue: goal.score, newValue: newScore });
      goal.score = newScore;
    }

    // Manager Comments
    if (updates.approvalComments !== undefined && updates.approvalComments !== goal.approvalComments) {
      changes.push({ field: "approvalComments", oldValue: goal.approvalComments, newValue: updates.approvalComments });
      goal.approvalComments = updates.approvalComments;
    }

    await goal.save();

    // Log Audit Trail
    if (changes.length > 0) {
      for (const change of changes) {
        let action = "Quarterly Update";
        if (change.field === "plannedTargetValue" || change.field === "actualAchievementValue") action = "KPI Progress Updated";
        if (change.field === "quarterlyStatus" && change.newValue === "completed") action = "Task Completed";
        else if (change.field === "quarterlyStatus") action = "Task Status Changed";
        if (change.field === "tasksCompleted" || change.field === "progress") action = "Task Progress Updated";

        await GoalAuditLog.create({
          goalId: goal._id,
          goalTitle: goal.title || "Untitled Goal",
          taskName: goal.title || "Untitled Task",
          userId: session.id,
          userName: session.name || "Unknown User",
          userRole: session.role || "Unknown Role",
          action,
          changes: [change],
        });
      }
    }

    // Fetch the updated goal with populated fields for response
    const updatedGoal = await Goal.findById(goal._id)
      .populate("assignedManager", "name")
      .populate("creator", "name")
      .lean();

    return NextResponse.json({ success: true, goal: updatedGoal });
  } catch (error) {
    console.error("Quarterly update error:", error);
    return NextResponse.json({ error: "Failed to update quarterly goal" }, { status: 500 });
  }
}
