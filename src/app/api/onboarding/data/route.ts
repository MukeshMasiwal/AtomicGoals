import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const managers = await User.find({ role: { $in: ["manager", "admin"] } })
      .select("name email department")
      .lean();

    const teams = await Team.find().select("name department manager").lean();

    return NextResponse.json({ managers, teams });
  } catch (error) {
    console.error("Fetch onboarding data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization data." },
      { status: 500 },
    );
  }
}
