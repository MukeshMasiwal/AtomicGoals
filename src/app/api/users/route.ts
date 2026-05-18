import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export async function GET() {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const sessionUser = (await User.findById(user.id)
      .select("team department")
      .lean()) as any;
    let query: any = {};

    if (user.role === "manager") {
      const managedTeam = await Team.findOne({ manager: user.id })
        .select("_id")
        .lean();
      const teamId = managedTeam?._id || sessionUser?.team;
      query = teamId
        ? { $or: [{ team: teamId }, { _id: user.id }] }
        : { _id: user.id };
    }

    if (user.role === "employee") {
      query = sessionUser?.team
        ? { $or: [{ team: sessionUser.team }, { _id: user.id }] }
        : { _id: user.id };
    }

    const users = await User.find(query)
      .select(
        "name email role department team manager verified onboardingCompleted createdAt employeeStatus approvalStatus",
      )
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      users: users.map((entry: any) => ({
        id: String(entry._id),
        name: entry.name,
        email: entry.email,
        role: entry.role,
        department: entry.department,
        team: entry.team,
        manager: entry.manager,
        status: entry.employeeStatus || "Active",
        approvalStatus: entry.approvalStatus || "Approved",
        accountStatus: entry.verified
          ? entry.onboardingCompleted
            ? "Active"
            : "Onboarding"
          : "Unverified",
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error("[users/GET]", error);
    return Response.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
