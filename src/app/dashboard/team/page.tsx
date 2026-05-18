import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import TeamClient from "./team-client";

export default async function TeamPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  await connectDB();
  const dbUser = (await User.findById(session.id).lean()) as any;

  const user = {
    name: dbUser?.name || session.name,
    avatar: dbUser?.avatar || "",
    role: session.role,
    roleLabel:
      session.role === "admin"
        ? "Administrator"
        : session.role === "manager"
          ? "Manager"
          : "Employee",
    team: String(dbUser?.team || ""),
  };

  return <TeamClient user={user} />;
}
