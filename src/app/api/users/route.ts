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
    const users = await User.find()
      .select("name email role department team createdAt")
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
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error("[users/GET]", error);
    return Response.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
