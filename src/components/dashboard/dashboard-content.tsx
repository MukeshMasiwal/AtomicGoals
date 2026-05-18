"use client";

import { motion } from "framer-motion";

import dynamic from "next/dynamic";

const AnalyticsSection = dynamic(
  () => import("@/components/dashboard/analytics-section"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse bg-muted rounded-xl" />
    ),
  },
);
import GoalsOverview from "@/components/dashboard/goals-overview";
import HeroSection from "@/components/dashboard/hero-section";
import PendingActions from "@/components/dashboard/pending-actions";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import RolePanels from "@/components/dashboard/role-panels";
import SectionHeader from "@/components/dashboard/section-header";
import type { DashboardData } from "@/lib/mock-data";

type DashboardContentProps = {
  data: DashboardData;
};

export default function DashboardContent({ data }: DashboardContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <HeroSection
        progress={data.progress}
        kpis={data.kpis}
        headline={data.hero.headline}
        subtitle={data.hero.subtitle}
      />

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Goals"
          title="Goals Overview"
          subtitle="Track approvals, weightage, and progress for every goal in the current cycle."
        />
        <GoalsOverview goals={data.goals} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Analytics"
          title="Quarterly Progress Analytics"
          subtitle="Performance insights across quarters, departments, and completion status."
        />
        <AnalyticsSection
          quarterlyPerformance={data.chartData.quarterlyPerformance}
          departmentComparison={data.chartData.departmentComparison}
          goalCompletion={data.chartData.goalCompletion}
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Pending Actions"
          title="What needs your attention"
          subtitle="Resolve approvals, updates, and feedback requests quickly."
        />
        <PendingActions items={data.pendingActions} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Activity"
            title="Recent Activity Feed"
            subtitle="Stay informed with the latest goal changes and updates."
          />
          <RecentActivity items={data.activityFeed} />
        </div>
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Quick Actions"
            title="Jump back in"
            subtitle="Speed through common actions without leaving the dashboard."
          />
          <QuickActions actions={data.quickActions} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Role View"
          title="Role-based insights"
          subtitle={`Tailored for ${data.user.roleLabel.toLowerCase()} responsibilities.`}
        />
        <RolePanels panels={data.rolePanels} role={data.user.role} />
      </section>
    </motion.div>
  );
}
