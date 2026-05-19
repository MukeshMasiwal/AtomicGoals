"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  FileDown,
  MessageSquare,
  RefreshCw,
  Shield,
  Target,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PendingAction } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap = {
  goals: Target,
  update: RefreshCw,
  feedback: MessageSquare,
  export: FileDown,
  audit: Shield,
} as const;

const borderMap = {
  blue: "border-l-primary",
  amber: "border-l-amber-500",
  emerald: "border-l-emerald-500",
  rose: "border-l-rose-500",
} as const;

const iconBgMap = {
  blue: "bg-primary/10 text-primary",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
} as const;

type PendingActionsProps = {
  items: PendingAction[];
};

export default function PendingActions({ items }: PendingActionsProps) {
  if (items.length === 0) {
    return (
      <Card className="border border-dashed border-border bg-card p-8 text-center shadow-soft">
        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-foreground/80">
          All caught up
        </p>
        <p className="text-xs text-muted-foreground">
          No pending actions right now.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {items.map((item, index) => {
        const Icon = iconMap[item.icon] ?? Target;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card
              className={cn(
                "border border-border border-l-4 bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg h-full",
                borderMap[item.tone],
              )}
            >
              <CardContent className="flex flex-col h-full space-y-3 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl",
                      iconBgMap[item.tone],
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground line-clamp-2 break-words">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3 break-words">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-1">
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl h-auto py-2 sm:py-2.5 text-xs sm:text-sm"
                    asChild
                  >
                    <Link href={`/dashboard/goals?selected=${item.id}`}>
                      <span className="truncate mr-2 text-left">{item.cta}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
