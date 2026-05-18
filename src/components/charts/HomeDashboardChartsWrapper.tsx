"use client";

import dynamic from "next/dynamic";

const DashboardCharts = dynamic(
  () => import("@/components/charts/HomeDashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] w-full animate-pulse bg-muted rounded-xl" />
    ),
  },
);

export default function HomeDashboardChartsWrapper() {
  return <DashboardCharts />;
}
