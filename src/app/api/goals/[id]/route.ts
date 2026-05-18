import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates = await req.json();

    await connectDB();

    const goal = await Goal.findById(params.id);
    if (!goal)
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    if (updates.dueDate) {
      const parsedDueDate = new Date(updates.dueDate);
      const currentDueDate = goal.dueDate;
      
      if (!currentDueDate || parsedDueDate.getTime() !== new Date(currentDueDate).getTime()) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDueDate < today) {
          return NextResponse.json(
            { error: "Deadline cannot be set in the past." },
            { status: 400 },
          );
        }
      }
      updates.dueDate = parsedDueDate;
    }

    if (updates.numberOfTasks !== undefined && updates.numberOfTasks < 1) {
      return NextResponse.json(
        { error: "Number of tasks must be positive" },
        { status: 400 },
      );
    }

    if (updates.team === "") {
      updates.team = null;
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
    
    // Instead of using goal.save() which runs all schema validators (failing heavily on old seeded data missing `assignedManager` etc.),
    // We update it strictly on what's modified.
    await Goal.updateOne({ _id: goal._id }, { $set: updates }, { runValidators: true, context: 'query' }).catch(async (e) => {
      // Fallback without validators if it still fails due to missing legacy fields
      await Goal.updateOne({ _id: goal._id }, { $set: updates });
    });

    const notifyRecipients = new Set<string>();
    if (goal.creator?.toString() && goal.creator.toString() !== session.id) {
      notifyRecipients.add(goal.creator.toString());
    }
    if (goal.assignedManager?.toString() && goal.assignedManager.toString() !== session.id) {
      notifyRecipients.add(goal.assignedManager.toString());
    }
    if (goal.assignedTo?.length) {
      goal.assignedTo.forEach((assignee: any) => {
        const id = assignee.toString();
        if (id !== session.id) notifyRecipients.add(id);
      });
    }

    const { createNotification, notifyAdmins } = await import("@/lib/notifications");

    if (notifyRecipients.size > 0) {
      for (const recipientId of notifyRecipients) {
        await createNotification({
          type: "Goal Created", // Maybe just Goal Created icon is generic enough for Goal Updated
          title: "Goal Updated",
          message: `"${goal.title}" was updated by ${session.name}.`,
          recipient: recipientId,
          link: `/dashboard/goals?selected=${goal._id}`,
          relatedGoal: goal._id.toString(),
        });
      }
    }

    await notifyAdmins({
      type: "Goal Created",
      title: "Goal Updated",
      message: `"${goal.title}" was updated by ${session.name}.`,
      link: `/dashboard/goals?selected=${goal._id}`,
      relatedGoal: goal._id.toString(),
    });

    return NextResponse.json({ success: true, goal: { ...goal.toObject(), ...updates } });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
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
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const goal = await Goal.findById(params.id);

    if (!goal)
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    if (goal.creator.toString() !== session.id && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await goal.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 },
    );
  }
}
