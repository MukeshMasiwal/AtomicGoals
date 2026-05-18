import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import GoalsClient from "./goals-client";

export default async function GoalsPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  await connectDB();
  const dbUser = (await User.findById(session.id).lean()) as any;

  const user = {
    id: session.id,
    name: dbUser?.name || session.name,
    avatar: dbUser?.avatar || "",
    role: session.role,
    roleLabel:
      session.role === "admin"
        ? "Administrator"
        : session.role === "manager"
          ? "Manager"
          : "Employee",
  };

  return <GoalsClient user={user} />;
}
