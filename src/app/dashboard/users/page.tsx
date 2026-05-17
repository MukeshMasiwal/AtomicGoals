import { redirect } from "next/navigation";

import DashboardShell from "@/components/layout/dashboard-shell";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { canManageUsers } from "@/lib/permissions";
import { User } from "@/models/User";
import { roleLabel } from "@/utils/roles";

export default async function UsersPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session)) {
    redirect("/dashboard");
  }

  await connectDB();
  const users = await User.find()
    .select("name email role department createdAt")
    .sort({ createdAt: -1 })
    .lean<{
      _id: unknown;
      name: string;
      email: string;
      role: string;
      department?: string;
    }[]>();

  return (
    <DashboardShell
      title="Users"
      userName={session.name}
      roleLabel={roleLabel(session.role)}
      role={session.role}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Organization users</h2>
        <p className="mt-1 text-sm text-slate-500">
          Admin-only view of all accounts in the {process.env.DB_NAME ?? "goaltrack"}{" "}
          database.
        </p>
        <ul className="mt-6 divide-y divide-slate-100">
          {users.map((user) => (
            <li
              key={String(user._id)}
              className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm"
            >
              <UserRow user={user} />
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  );
}

function UserRow({
  user,
}: {
  user: {
    _id: unknown;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}) {
  return (
    <>
      <div>
        <p className="font-medium text-slate-900">{user.name}</p>
        <p className="text-slate-500">{user.email}</p>
      </div>
      <div className="text-right">
        <p className="font-medium capitalize text-slate-700">{user.role}</p>
        <p className="text-slate-500">{user.department || "—"}</p>
      </div>
    </>
  );
}
