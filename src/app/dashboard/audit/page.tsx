import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import AuditClient from "./audit-client";

export const metadata = {
  title: "Audit Logs - AtomicGoals",
  description: "Enterprise audit trail and governance logs.",
};

export default async function AuditLogsPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "employee") {
    redirect("/dashboard");
  }

  await connectDB();
  const dbUser = (await User.findById(session.id).lean()) as any;

  return (
    <AuditClient 
      user={{
        id: session.id,
        name: dbUser?.name || session.name,
        role: session.role,
        roleLabel: session.role === "admin"
          ? "Administrator"
          : session.role === "manager"
            ? "Manager"
            : "Employee",
        avatar: dbUser?.avatar || "",
        department: dbUser?.department || "",
      }} 
    />
  );
}
