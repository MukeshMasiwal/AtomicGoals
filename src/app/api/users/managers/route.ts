import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const managers = await User.find({ role: { $in: ["manager", "admin"] } })
      .select("name email role")
      .lean();

    return Response.json(managers);
  } catch (error) {
    console.error("[users/managers]", error);
    return Response.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}
