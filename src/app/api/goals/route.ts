import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import {
  canEmployeeMutateGoal,
  canManagerManageGoal,
  calculateWeightedProgress,
  normalizeGoalForResponse,
  resolveEnterpriseGoalWeights,
} from "@/lib/goal-enterprise";
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

    return NextResponse.json({
      goals: goals.map((goal) => normalizeGoalForResponse(goal)),
    });
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
      department,
      priority,
      dueDate,
      progress,
      approvalStatus,
      assignedManager,
      numberOfTasks,
      goalWeightage,
      kpiType,
      uom,
      thrustArea,
      plannedTargetValue,
      isShared,
      sharedGoalGroupId,
      primaryOwnerId,
      contributingTeams,
      contributionPermissions,
      contributionPercentage,
    } = await req.json();

    if (!dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 },
      );
    }
    const parsedDueDate = new Date(dueDate);
    
    // Normalize both dates to UTC midnight to avoid local timezone offset bugs
    const dueUTC = Date.UTC(parsedDueDate.getUTCFullYear(), parsedDueDate.getUTCMonth(), parsedDueDate.getUTCDate());
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    if (dueUTC < todayUTC) {
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

    if (numberOfTasks && (numberOfTasks < 1 || numberOfTasks > 10)) {
      return NextResponse.json(
        { error: "Number of tasks must be between 1 and 10" },
        { status: 400 },
      );
    }

    if (uom === "Percentage" && plannedTargetValue !== undefined && plannedTargetValue !== "") {
      const targetNum = Number(plannedTargetValue);
      if (targetNum < 0 || targetNum > 100 || Number.isNaN(targetNum)) {
        return NextResponse.json(
          { error: "Percentage target must be between 0 and 100." },
          { status: 400 }
        );
      }
    }

    const parsedGoalWeightage =
      goalWeightage === undefined || goalWeightage === null || goalWeightage === ""
        ? null
        : Number(goalWeightage);

    if (parsedGoalWeightage !== null) {
      if (Number.isNaN(parsedGoalWeightage)) {
        return NextResponse.json(
          { error: "Goal weightage must be a number" },
          { status: 400 },
        );
      }
      if (parsedGoalWeightage < 10) {
        return NextResponse.json(
          { error: "Each goal must have at least 10% weightage." },
          { status: 400 },
        );
      }
      if (parsedGoalWeightage > 100) {
        return NextResponse.json(
          { error: "Goal weightage cannot exceed 100%." },
          { status: 400 },
        );
      }
    }

    await connectDB();

    const creatorUser = (await User.findById(session.id)
      .select("team department role")
      .lean()) as any;
    const targetTeam = team
      ? ((await Team.findById(team).select("manager department members").lean()) as any)
      : null;
    const participantIds = new Set<string>(
      (Array.isArray(assignedTo) && assignedTo.length > 0
        ? assignedTo
        : [session.id]
      ).map((value: unknown) => String(value)),
    );

    const activeGoalQueries = Array.from(participantIds).map((participantId) => ({
      $or: [{ creator: participantId }, { assignedTo: participantId }],
      approvalStatus: { $ne: "Rejected" },
      status: { $ne: "completed" },
    }));

    if (activeGoalQueries.length > 0) {
      const participantGoals = await Goal.find({ $or: activeGoalQueries }).lean();
      const validation = resolveEnterpriseGoalWeights([
        ...participantGoals,
        {
          _id: "new-goal",
          goalWeightage: parsedGoalWeightage,
          progress: progress ?? 0,
          status: "not-started",
          approvalStatus: "Pending Approval",
        },
      ]);

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      if (participantGoals.length >= 10) {
        return NextResponse.json(
          { error: "Maximum 10 tasks allowed per goal." },
          { status: 400 },
        );
      }
    }

    if (session.role === "employee" && team && creatorUser?.team && String(creatorUser.team) !== String(team)) {
      return NextResponse.json(
        { error: "Employees can only create goals for their own team." },
        { status: 403 },
      );
    }

    if (targetTeam && assignedManager) {
      const isTeamManager = String(targetTeam.manager) === String(assignedManager);
      const isTeamMember = targetTeam.members?.some((m: any) => String(m) === String(assignedManager));
      
      if (!isTeamManager && !isTeamMember) {
        return NextResponse.json(
          { error: "Assigned manager must belong to the selected team." },
          { status: 400 },
        );
      }
    }

    if (session.role === "manager" && targetTeam && String(targetTeam.manager) !== session.id) {
      return NextResponse.json(
        { error: "Managers can only create goals for teams they manage." },
        { status: 403 },
      );
    }

    // Approval logic based on roles
    let finalStatus = approvalStatus || "Draft";
    
    if (session.role === "admin") {
      finalStatus = approvalStatus || "Approved";
    }

    if (["Approved", "Rejected", "Pending Approval"].includes(finalStatus) && !approvalStatus) {
      if (session.role === "employee" || session.role === "manager") {
        finalStatus = "Draft"; // Default new goals to Draft so they can compile a sheet
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
      goalWeightage: parsedGoalWeightage,
      contributionPercentage:
        numberOfTasks && Number(numberOfTasks) > 0
          ? Math.round(((parsedGoalWeightage ?? 10) / Number(numberOfTasks)) * 10) / 10
          : parsedGoalWeightage ?? 10,
      contributingTeams: contributingTeams || [],
      contributionPermissions: contributionPermissions || ["team-members"],
      approvalStatus: finalStatus,
      department: department || creatorUser?.department || "",
      assignedManager,
      kpiType: kpiType || "min",
      uom: uom || "Numeric",
      thrustArea: thrustArea || "",
      plannedTargetValue: plannedTargetValue !== undefined && plannedTargetValue !== "" ? Number(plannedTargetValue) : null,
      isShared: isShared || false,
      sharedGoalGroupId: sharedGoalGroupId || "",
      primaryOwnerId: primaryOwnerId || null,
    };
    if (team) {
      payload.team = team;
    }

    let createdGoals: any[] = [];
    const groupId = isShared ? new Date().getTime().toString() : "";

    if (isShared && Array.isArray(assignedTo) && assignedTo.length > 0) {
      const docsToCreate = assignedTo.map((assigneeId: string) => ({
        ...payload,
        assignedTo: [assigneeId],
        sharedGoalGroupId: groupId,
        primaryOwnerId: session.id,
      }));
      createdGoals = await Goal.insertMany(docsToCreate);
    } else {
      createdGoals = [await Goal.create(payload)];
    }

    const goal = createdGoals[0]; // Reference for notifications

    // Notification logic
    const creatorProfile = await User.findById(session.id);
    const creatorDept = creatorProfile?.department || "No Department";

    const { createNotification, notifyAdmins } = await import("@/lib/notifications");

    const newNotifBase = {
      title: isShared ? "Shared Goal Assigned" : "New Task Created",
      message: isShared 
        ? `You have been assigned a shared goal "${title}" by ${session.name}.`
        : `New task "${title}" [Priority: ${priority}] created by ${session.name} (${creatorDept}).`,
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

    // Notify all assigned users
    if (assignedTo && assignedTo.length > 0) {
      for (const uid of assignedTo) {
        if (uid !== session.id && uid !== assignedManager) {
          await createNotification({
            ...newNotifBase,
            recipient: uid,
          });
        }
      }
    }

    const teamDoc = team ? await Team.findById(team).select("name").lean() : null;
    const teamName = teamDoc ? (teamDoc as any).name : "No Team";

    await notifyAdmins({
      type: "Goal Created",
      title: "Goal Created",
      message: `${session.name} submitted a new goal: ${title} (${teamName})`,
      link: `/dashboard/goals?selected=${goal._id}`,
      relatedGoal: goal._id.toString(),
    });

    return NextResponse.json({ success: true, goal: normalizeGoalForResponse(goal.toObject()) });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 },
    );
  }
}
