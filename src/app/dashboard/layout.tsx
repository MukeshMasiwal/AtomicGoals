import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  await connectDB();
  const dbUser = await User.findById(session.id).lean() as any;

  if (dbUser && !dbUser.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
