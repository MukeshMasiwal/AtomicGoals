import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    let query: any = {};

    if (session.role === "manager") {
      const managedTeam = await Team.findOne({ manager: session.id })
        .select("_id")
        .lean<{ _id: { toString(): string } }>();

      if (managedTeam?._id) {
        query = { _id: managedTeam._id };
      } else {
        const user = await User.findById(session.id)
          .select("team")
          .lean<{ team?: { toString(): string } }>();
        query = user?.team ? { _id: user.team } : { _id: null };
      }
    }

    if (session.role === "employee") {
      const user = await User.findById(session.id)
        .select("team")
        .lean<{ team?: { toString(): string } }>();
      query = user?.team ? { _id: user.team } : { _id: null };
    }

    const teams = await Team.find(query)
      .populate("manager", "name email avatar role")
      .populate("members", "name email avatar role jobTitle")
      .lean();

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Fetch teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, members, department, managerId } = await req.json();
    const manager = session.role === "admin" ? managerId : session.id;

    if (!name || !manager) {
      return NextResponse.json(
        { error: "Team name and manager are required." },
        { status: 400 },
      );
    }

    const uniqueMembers = Array.from(
      new Set((members || []).filter((id: string) => id !== manager)),
    );

    if (uniqueMembers.length + 1 > 8) {
      return NextResponse.json(
        { error: "Team limit reached (8/8 members)." },
        { status: 400 },
      );
    }

    await connectDB();
    const team = await Team.create({
      name,
      department: department || "Engineering",
      manager,
      members: uniqueMembers,
    });

    // Update users' team field
    await User.updateOne({ _id: manager }, { team: team._id });
    if (uniqueMembers.length > 0) {
      await User.updateMany({ _id: { $in: uniqueMembers } }, { team: team._id });
    }

    const { createNotification, notifyAdmins } = await import("@/lib/notifications");

    const notifyIds = [manager, ...uniqueMembers].filter(
      (id) => id && id !== session.id,
    );
    if (notifyIds.length > 0) {
      for (const notifyId of notifyIds) {
        await createNotification({
          type: "Team Updated",
          title: "Team Created",
          message: `You have been added to the "${team.name}" team.`,
          recipient: notifyId,
          link: "/dashboard/team",
          relatedTeam: team._id.toString(),
        });
      }
    }

    await notifyAdmins({
      type: "Team Updated",
      title: "New Team Created",
      message: `${session.name} created the "${team.name}" team.`,
      link: "/dashboard/team",
      relatedTeam: team._id.toString(),
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}
