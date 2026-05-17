import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { canManageUsers } from "@/lib/permissions";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import UsersClient from "./users-client";

export default async function UsersPage() {
  const session = await getSessionFromCookies();
  
  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session)) {
    redirect("/dashboard");
  }

  await connectDB();
  const dbUser = await User.findById(session.id).lean() as any;

  const user = {
    id: session.id,
    name: dbUser?.name || session.name,
    avatar: dbUser?.avatar || "",
    role: session.role,
    roleLabel: session.role === "admin" ? "Administrator" : session.role === "manager" ? "Manager" : "Employee",
    team: String(dbUser?.team || ""),
  };

  return <UsersClient sessionUser={user} />;
}
