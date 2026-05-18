"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock4, TrendingUp, Users2 } from "lucide-react";

import KpiCard from "@/components/dashboard/kpi-card";
import ProgressRing from "@/components/charts/progress-ring";
import { Card, CardContent } from "@/components/ui/card";
import type { KpiItem } from "@/lib/mock-data";

type HeroSectionProps = {
  progress: number;
  kpis: KpiItem[];
  headline: string;
  subtitle: string;
};

const icons = [CheckCircle2, Clock4, TrendingUp, Users2];

export default function HeroSection({
  progress,
  kpis,
  headline,
  subtitle,
}: HeroSectionProps) {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 shadow-soft ring-1 ring-slate-200/60 dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900/50 dark:ring-slate-800">
      <CardContent className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            GoalTrack Overview
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
            {headline}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground dark:text-slate-300">
            {subtitle}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {kpis.map((kpi, index) => {
              const Icon = icons[index % icons.length];
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07, duration: 0.4 }}
                >
                  <KpiCard
                    icon={<Icon className="h-5 w-5" />}
                    label={kpi.label}
                    value={String(kpi.value)}
                    trend={kpi.trend}
                    tone={kpi.tone}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card/60 p-6 backdrop-blur-sm dark:bg-slate-800/40"
        >
          <ProgressRing value={progress} />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground dark:text-slate-400">
              Current Quarter
            </p>
            <p className="text-lg font-semibold text-foreground">
              Q2 2026 Progress
            </p>
            <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300">
              {progress >= 80
                ? "Excellent momentum — keep it up!"
                : progress >= 60
                  ? "On track — a few items need attention."
                  : "Focus on pending goals this week."}
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
