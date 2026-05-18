import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { canManageUsers } from "@/lib/permissions";
import { User } from "@/models/User";

export async function GET() {
  const user = await getSessionFromCookies();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const sessionUser = (await User.findById(user.id)
      .select("department")
      .lean()) as any;
    let query = {};
    if (user.role === "manager") {
      query = { department: sessionUser?.department };
    }

    const users = await User.find(query)
      .select(
        "name email role department team manager verified onboardingCompleted createdAt employeeStatus",
      )
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      users: users.map((entry) => ({
        id: String(entry._id),
        name: entry.name,
        email: entry.email,
        role: entry.role,
        department: entry.department,
        team: entry.team,
        manager: entry.manager,
        status: entry.employeeStatus || "Active",
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
