"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Edit3,
  MessageCircle,
  Send,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeConfig = {
  approved: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  edited: { icon: Edit3, color: "text-blue-600 bg-blue-50" },
  submitted: { icon: Send, color: "text-indigo-600 bg-indigo-50" },
  feedback: { icon: MessageCircle, color: "text-amber-600 bg-amber-50" },
} as const;

type RecentActivityProps = {
  items: ActivityItem[];
};

export default function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <Card className="border border-dashed border-border bg-card p-8 text-center shadow-soft">
        <Activity className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-muted-foreground">
          No recent activity yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0">
          {items.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            const isLast = index === items.length - 1;

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                {!isLast ? (
                  <span
                    className="absolute left-4 sm:left-5 top-10 sm:top-12 h-[calc(100%-1.5rem)] sm:h-[calc(100%-2rem)] w-px bg-slate-200"
                    aria-hidden
                  />
                ) : null}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full",
                    config.color,
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {item.time}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                      <AvatarFallback className="bg-muted text-[9px] sm:text-[10px] font-semibold text-foreground/80">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {item.actor}
                    </span>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
