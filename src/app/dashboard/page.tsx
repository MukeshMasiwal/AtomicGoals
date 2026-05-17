import DashboardContent from "@/components/dashboard/dashboard-content";
import DashboardShell from "@/components/layout/dashboard-shell";
import { fetchDashboardData } from "@/actions/dashboard";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const data = await fetchDashboardData();

  return (
    <DashboardShell
      title="Dashboard"
      userName={data.user.name}
      roleLabel={data.user.roleLabel}
      role={session.role}
    >
      <DashboardContent data={data} />
    </DashboardShell>
  );
}
