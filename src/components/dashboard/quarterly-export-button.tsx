"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

export function QuarterlyExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = (format: "csv" | "xlsx") => {
    setLoading(true);
    // Simple window location change will trigger a download without leaving page
    window.location.href = `/api/export?format=${format}`;
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => handleExport("csv")}
        disabled={loading}
        className="flex items-center gap-2 border-border bg-card hover:bg-muted"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        onClick={() => handleExport("xlsx")}
        disabled={loading}
        className="flex items-center gap-2 border-border bg-card hover:bg-muted text-emerald-600 dark:text-emerald-500"
      >
        <Download className="h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}
