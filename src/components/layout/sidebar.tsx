"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Settings,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: Target,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Quarterly Updates",
    href: "/dashboard/quarterly-updates",
    icon: RefreshCw,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Admin Panel",
    href: "/dashboard/users",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["manager", "admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["employee", "manager", "admin"],
  },
];

type SidebarProps = {
  role: Role;
  collapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
};

export default function Sidebar({
  role,
  collapsed = false,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col gap-6 border-r border-border/80 bg-card px-4 py-6 shadow-soft transition-all duration-300",
        collapsed && "w-[88px] px-3",
      )}
    >
      <div className="flex items-center px-2 py-2">
        <Logo showText={!collapsed} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-all hover:bg-muted hover:text-foreground",
                isActive &&
                  "bg-primary/10 text-primary shadow-sm shadow-primary/5",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-slate-700",
                )}
              />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => {
          void handleLogout();
          onClose?.();
        }}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        {!collapsed ? <span>Logout</span> : null}
      </button>

      {onToggleCollapse ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-2 hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      ) : null}
    </aside>
  );
}
