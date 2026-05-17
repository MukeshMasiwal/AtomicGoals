"use client";

import dynamic from "next/dynamic";

const DashboardCharts = dynamic(() => import("@/components/charts/HomeDashboardCharts"), { 
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse bg-slate-100 rounded-xl" />
});

export default function HomeDashboardChartsWrapper() {
  return <DashboardCharts />;
}
