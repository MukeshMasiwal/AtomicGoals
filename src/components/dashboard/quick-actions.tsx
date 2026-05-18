"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FileDown, Plus, RefreshCw, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actionIcons: Record<string, typeof Plus> = {
  "Create Goal": Plus,
  "Submit Update": RefreshCw,
  "Export Report": FileDown,
  "View Team Progress": Users,
  "Approve Goals": Users,
  "View My Goals": Users,
  "Request Feedback": RefreshCw,
  "Schedule 1:1": Users,
  "Export Team Report": FileDown,
  "View Audit Logs": FileDown,
  "Manage Users": Users,
  "Org Settings": RefreshCw,
};

type QuickActionsProps = {
  actions: string[];
};

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="border border-border bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.map((action, index) => {
          const Icon = actionIcons[action] ?? Plus;
          return (
            <motion.div
              key={action}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.02 }}
            >
              <Button
                variant="outline"
                className="h-auto w-full justify-between rounded-xl border-border px-4 py-3.5 text-left font-medium hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  {action}
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Button>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
