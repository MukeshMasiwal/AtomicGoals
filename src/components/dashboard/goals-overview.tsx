"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GoalItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusToVariant: Record<
  string,
  "default" | "amber" | "emerald" | "slate" | "rose"
> = {
  Draft: "slate",
  Pending: "amber",
  Approved: "emerald",
  Rejected: "rose",
};

type GoalsOverviewProps = {
  goals: GoalItem[];
};

function GoalCard({ goal }: { goal: GoalItem }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-lg border border-border bg-card p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">{goal.title}</p>
        <Badge variant={statusToVariant[goal.status] ?? "slate"} className="text-[10px] px-1.5 py-0">
          {goal.status}
        </Badge>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <div>
          <span className="block">Weightage</span>
          <span className="font-medium text-foreground">{goal.weight || "10%"}</span>
        </div>
        <div>
          <span className="block">Deadline</span>
          <span className="font-medium text-foreground">{goal.deadline}</span>
        </div>
      </div>
      <div className="mt-2.5 space-y-1.5">
        <div className="flex justify-between text-[10px] sm:text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-1.5" />
      </div>
      <p className="mt-2.5 pt-2 border-t border-border/50 text-[10px] sm:text-[11px] text-muted-foreground">
        Approval: <span className="font-medium text-foreground/80">{goal.approval}</span>
      </p>
    </motion.div>
  );
}

export default function GoalsOverview({ goals }: GoalsOverviewProps) {
  if (goals.length === 0) {
    return (
      <Card className="border border-dashed border-border bg-card p-10 text-center shadow-soft">
        <p className="text-sm font-medium text-foreground/80">No goals yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first goal to get started.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:hidden">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      <Card className="hidden border border-border bg-card shadow-soft md:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Active Goals</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Goal Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Weightage</TableHead>
                <TableHead className="min-w-[180px]">Progress</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal) => (
                <TableRow
                  key={goal.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <TableCell className="font-medium text-foreground">
                    {goal.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusToVariant[goal.status] ?? "slate"}>
                      {goal.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground/80">
                    {goal.weight || "10%"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Progress value={goal.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {goal.progress}% complete
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/80">
                    {goal.deadline}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm",
                        goal.approval.includes("Awaiting") ||
                          goal.approval.includes("pending")
                          ? "font-medium text-amber-600 dark:text-amber-500"
                          : "text-foreground/80",
                      )}
                    >
                      {goal.approval}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
