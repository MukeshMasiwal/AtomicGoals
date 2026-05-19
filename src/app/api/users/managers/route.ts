import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    let query: any = {};

    if (session.role === "admin") {
      query = { role: { $in: ["manager", "admin"] } };
    } else if (session.role === "manager") {
      query = { _id: session.id };
    } else if (session.role === "employee") {
      const employee = await User.findById(session.id).select("team").lean<{ team?: { toString(): string } }>();
      if (employee?.team) {
        const team = await Team.findById(employee.team).select("manager").lean<{ manager?: { toString(): string } }>();
        if (team?.manager) {
          query._id = team.manager;
        } else {
          query._id = null; // Force empty result
        }
      } else {
        query._id = null; // Force empty result
      }
    }

    const managers = await User.find(query)
      .select("name email role")
      .lean();

    const formattedManagers = managers.map((m: any) => ({
      ...m,
      id: String(m._id),
    }));

    return Response.json({ managers: formattedManagers });
  } catch (error) {
    console.error("[users/managers]", error);
    return Response.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}
