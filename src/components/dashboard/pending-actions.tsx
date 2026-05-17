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
      <Card className="border border-dashed border-slate-200 bg-white p-8 text-center shadow-soft">
        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">All caught up</p>
        <p className="text-xs text-slate-400">No pending actions right now.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                "border border-slate-200 border-l-4 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg",
                borderMap[item.tone]
              )}
            >
              <CardContent className="space-y-4 px-5 py-5">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      iconBgMap[item.tone]
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full justify-between rounded-xl">
                  {item.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
