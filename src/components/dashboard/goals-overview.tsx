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
      className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-foreground">{goal.title}</p>
        <Badge variant={statusToVariant[goal.status] ?? "slate"}>
          {goal.status}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div>
          <span className="block text-muted-foreground">Weight</span>
          <span className="font-medium text-slate-700">{goal.weight}</span>
        </div>
        <div>
          <span className="block text-muted-foreground">Deadline</span>
          <span className="font-medium text-slate-700">{goal.deadline}</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-slate-700">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Approval: <span className="text-foreground/80">{goal.approval}</span>
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
                    {goal.weight}
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
                          ? "font-medium text-amber-600"
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
