"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, History, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuditClient({ user }: { user: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/audit");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        (log.goalTitle || "").toLowerCase().includes(s) ||
        (log.taskName || "").toLowerCase().includes(s) ||
        (log.userName || "").toLowerCase().includes(s) ||
        (log.action || "").toLowerCase().includes(s);

      const matchesAction = filterAction === "all" || log.action === filterAction;

      return matchesSearch && matchesAction;
    });
  }, [logs, search, filterAction]);

  return (
    <DashboardShell
      title="Audit Logs"
      userName={user.name}
      avatar={user.avatar}
      roleLabel={user.roleLabel}
      role={user.role}
    >
      <div className="w-full min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-indigo-500" /> Enterprise Audit Trail
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground text-xs sm:text-sm mt-1">
              Immutable log of modifications to locked and approved goals.
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by goal title, user, or action..."
                className="pl-9 h-9 sm:h-10 text-sm bg-card border-border w-full"
              />
            </div>
            <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="h-9 sm:h-10 w-full rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="all">All Actions</option>
                <option value="Task Progress Updated">Task Progress Updated</option>
                <option value="Task Completed">Task Completed</option>
                <option value="Task Status Changed">Task Status Changed</option>
                <option value="Task Reassigned">Task Reassigned</option>
                <option value="Task Renamed">Task Renamed</option>
                <option value="Deadline Modified">Deadline Modified</option>
                <option value="Goal Weightage Changed">Goal Weightage Changed</option>
                <option value="KPI Progress Updated">KPI Progress Updated</option>
                <option value="Quarterly Update">Quarterly Update</option>
                <option value="EDITED_AFTER_APPROVAL">Edited After Approval</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent p-12 text-center shadow-none">
            <History className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Audit Logs Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No modifications have been recorded for locked or approved goals yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log._id} className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md">
                <div className="border-b border-border bg-muted/20 px-4 py-3 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={null} className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-sm">
                        {log.action}
                      </Badge>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground truncate max-w-[200px] sm:max-w-xs">
                          Task: {log.taskName || log.goalTitle || "Unknown Task"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                          Goal: {log.goalTitle || "Unknown Goal"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {(log.userName || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{log.userName || "Unknown User"}</span>
                        <span className="opacity-70">({log.userRole || "Unknown Role"})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 border-t border-border/50 pt-2 mt-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{log.userName || "Unknown User"}</span> performed action <strong>{log.action}</strong> on Task: <span className="font-semibold text-slate-900 dark:text-slate-100">{log.taskName || log.goalTitle || "Unknown Task"}</span> in Goal: <span className="font-semibold text-slate-900 dark:text-slate-100">{log.goalTitle || "Unknown Goal"}</span>
                  </div>
                  {log.comment && (
                    <div className="mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-md text-sm italic text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400 not-italic block mb-1">Contribution Note:</span>
                      "{log.comment}"
                    </div>
                  )}
                </div>
                <div className="p-4 bg-card/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(log.changes || []).map((change: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{change.field}</span>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="line-through opacity-60 text-rose-500 truncate max-w-[120px]" title={String(change.oldValue)}>
                            {change.oldValue !== undefined && change.oldValue !== null ? String(change.oldValue) : "empty"}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[120px]" title={String(change.newValue)}>
                            {change.newValue !== undefined && change.newValue !== null ? String(change.newValue) : "empty"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!log.changes || log.changes.length === 0) && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> No specific field changes recorded.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
