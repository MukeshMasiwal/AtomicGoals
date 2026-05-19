"use client";

import { motion } from "framer-motion";
import { BarChart3, Shield, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role, RolePanel } from "@/lib/mock-data";
import { canViewAuditLogs } from "@/utils/roles";

const panelIcons = [Users, BarChart3, Shield];

type RolePanelsProps = {
  panels: RolePanel[];
  role: Role;
};

export default function RolePanels({ panels, role }: RolePanelsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {panels.map((panel, index) => {
        const Icon = panelIcons[index % panelIcons.length];
        return (
          <motion.div
            key={panel.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card className="h-full border border-border bg-card shadow-soft transition hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-2.5 sm:gap-3 space-y-0 pb-2">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <CardTitle className="text-sm sm:text-base">{panel.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {panel.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[13px] sm:text-sm text-foreground/80 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-primary/60 before:content-['']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                {panel.emptyState ? (
                  <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {panel.emptyState}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {canViewAuditLogs(role) ? (
        <Card className="border border-border bg-gradient-to-br from-slate-50 to-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Live Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <p className="pt-2 text-xs text-muted-foreground">
              Connecting to audit stream…
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Your Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete pending goals and submit your Q2 update to stay on track.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
