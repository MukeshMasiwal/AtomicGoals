import DashboardShell from "@/components/layout/dashboard-shell";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell
      title="Dashboard"
      userName="Mukesh"
      roleLabel="Employee"
      role="employee"
    >
      <DashboardSkeleton />
    </DashboardShell>
  );
}
