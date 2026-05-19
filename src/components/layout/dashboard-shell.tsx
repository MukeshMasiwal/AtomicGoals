"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { cn } from "@/lib/utils";

import type { Role } from "@/types";

type DashboardShellProps = {
  title: string;
  userName: string;
  avatar?: string;
  roleLabel: string;
  role: Role;
  children: React.ReactNode;
};

export default function DashboardShell({
  title,
  userName,
  avatar,
  roleLabel,
  role,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 h-full w-[84vw] max-w-xs overflow-hidden">
            <Sidebar role={role} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-300",
          collapsed ? "lg:ml-[88px]" : "lg:ml-64",
        )}
      >
        <TopNav
          title={title}
          userName={userName}
          avatar={avatar}
          roleLabel={roleLabel}
          onToggleSidebar={() => setMobileOpen(true)}
        />
        <main className="flex-1 min-w-0 space-y-4 sm:space-y-6 bg-muted/30 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
