import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const params = await context.params;
    const session = await getSessionFromCookies();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const team = await Team.findById(params.id);

    if (!team)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Only Admin or the Team's Manager can remove members
    if (session.role !== "admin" && team.manager.toString() !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    team.members = team.members.filter(
      (m: any) => m.toString() !== params.memberId,
    );
    await team.save();

    await User.findByIdAndUpdate(params.memberId, { team: "" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove team member error:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 },
    );
  }
}
