import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import QuarterlyUpdatesClient from "./quarterly-updates-client";
import { getQuarterlyWindowInfo } from "@/lib/quarterly";

export default async function QuarterlyUpdatesPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const user = (await User.findById(session.id).select("department team").lean()) as any;
  const userDept = user?.department || "";
  const userTeam = user?.team || null;

  let filter: any = {};
  if (session.role === "manager") {
    filter = { department: userDept };
  } else if (session.role === "employee") {
    filter = {
      $or: [
        { creator: session.id },
        { assignedTo: session.id },
        { team: userTeam },
        { department: userDept },
      ],
    };
  }

  const goals = (await Goal.find(filter)
    .populate("assignedManager", "name")
    .populate("creator", "name")
    .sort({ createdAt: -1 })
    .lean()) as any[];

  // Convert ObjectIds to strings
  const formattedGoals = JSON.parse(JSON.stringify(goals));

  const windowInfo = getQuarterlyWindowInfo();

  return (
    <QuarterlyUpdatesClient
      user={{
        id: session.id,
        name: session.name,
        role: session.role,
      }}
      initialGoals={formattedGoals}
      windowInfo={windowInfo}
    />
  );
}
