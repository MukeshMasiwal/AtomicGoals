"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageSquare, TrendingUp, UserCheck, CheckCircle, Loader2, AlertCircle, Edit, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { QuarterlyExportButton } from "@/components/dashboard/quarterly-export-button";

export default function QuarterlyUpdatesClient({ user, initialGoals, windowInfo }: { user: any, initialGoals: any[], windowInfo: any }) {
  const [goals, setGoals] = useState<any[]>(initialGoals);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit State
  const [editValues, setEditValues] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<any>({});
  
  // Manager Comment
  const [commentValues, setCommentValues] = useState<any>({});

  const handleEdit = (goal: any) => {
    setEditingId(goal._id);
    setEditValues({
      plannedTargetValue: goal.plannedTargetValue ?? "",
      actualAchievementValue: goal.actualAchievementValue ?? "",
      quarterlyStatus: goal.quarterlyStatus || "not-started",
      progress: goal.progress || 0,
      kpiType: goal.kpiType || "min",
      tasksCompleted: goal.tasksCompleted || 0,
      numberOfTasks: goal.numberOfTasks || 1,
    });
    setValidationErrors({});
  };

  const handleTasksCompletedChange = (val: number) => {
    const newProgress = Math.round((val / (editValues.numberOfTasks || 1)) * 100);
    setEditValues({...editValues, tasksCompleted: val, progress: newProgress});
  };

  const handleSave = async (goalId: string) => {
    setLoading(true);
    try {
      const payload = {
        ...editValues,
        plannedTargetValue: editValues.plannedTargetValue !== "" ? Number(editValues.plannedTargetValue) : null,
        actualAchievementValue: editValues.actualAchievementValue !== "" ? Number(editValues.actualAchievementValue) : null,
        progress: Number(editValues.progress) || 0,
        tasksCompleted: Number(editValues.tasksCompleted) || 0,
        isQuarterlyUpdate: true, // Custom flag to trigger audit and score calculation on backend
      };
      
      // Local validation before submit
      if (payload.plannedTargetValue !== null && payload.plannedTargetValue < 0) {
        setValidationErrors({ plannedTargetValue: "Planned Target cannot be negative." });
        setLoading(false);
        return;
      }
      if (payload.actualAchievementValue !== null && payload.actualAchievementValue < 0) {
        setValidationErrors({ actualAchievementValue: "Actual Achievement cannot be negative." });
        setLoading(false);
        return;
      }
      setValidationErrors({});

      const res = await fetch(`/api/goals/${goalId}/quarterly`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { goal } = await res.json();
        setGoals(goals.map(g => g._id === goalId ? { ...g, ...goal } : g));
        setEditingId(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleManagerComment = async (goalId: string) => {
    if (!commentValues[goalId]) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/goals/${goalId}/quarterly`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalComments: commentValues[goalId],
          isQuarterlyUpdate: true
        }),
      });

      if (res.ok) {
        const { goal } = await res.json();
        setGoals(goals.map(g => g._id === goalId ? { ...g, ...goal } : g));
        setCommentValues({ ...commentValues, [goalId]: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      title="Quarterly Updates"
      userName={user.name || "User"}
      roleLabel={
        user.role === "admin"
          ? "Administrator"
          : user.role === "manager"
            ? "Manager"
            : "Employee"
      }
      role={user.role}
    >
      <div className="w-full min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground ">
              Quarterly Reviews & Check-ins
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-1">
              Review past performance, update KPIs, and manager comments.
            </p>
          </div>
          <QuarterlyExportButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="min-w-0 border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Current Quarter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <div className="text-2xl font-bold">{windowInfo.name}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {!windowInfo.isOpen ? (
                   <><AlertCircle className="h-3 w-3 text-amber-500"/> Window is currently closed</>
                ) : (
                   `Closes: ${new Date(windowInfo.lockDate).toLocaleDateString("en-US")}`
                )}
              </p>
            </CardContent>
          </Card>
          <Card className="min-w-0 border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <div className="text-2xl font-bold">
                  {goals.length > 0
                    ? Math.round(
                        goals.reduce((acc, g) => acc + (g.progress || 0), 0) /
                          goals.length,
                      )
                    : 0}
                  %
                </div>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Average goal completion
              </p>
            </CardContent>
          </Card>
        </div>

        {!windowInfo.isOpen && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-4 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">Quarterly check-in window currently closed. Admin override required for edits.</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground ">
            Quarterly Goals & Feedback
          </h3>
          <div className="relative border-l border-border ml-3 space-y-8 pb-4">
            {goals.length === 0 ? (
              <p className="pl-6 text-sm text-muted-foreground">
                No quarterly goals found.
              </p>
            ) : (
              goals.map((goal) => {
                const isEditing = editingId === goal._id;
                const canEdit = user.role === "admin" || (windowInfo.isOpen && String(goal.creator?._id || goal.creator) === user.id);
                const isManager = user.role === "manager" || user.role === "admin";
                
                return (
                <div key={goal._id} className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-indigo-600 bg-card " />
                  <Card className="min-w-0 border-border/60 shadow-sm bg-card/80 backdrop-blur-xl ">
                    <CardHeader className="pb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {goal.title}
                          {goal.kpiType && (
                            <Badge variant={null} className="text-xs uppercase bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                              {goal.kpiType} KPI
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Manager: {goal.assignedManager?.name || "Unassigned"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={null}
                          className={
                            goal.quarterlyStatus === "completed"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : goal.quarterlyStatus === "on-track"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }
                        >
                          {goal.quarterlyStatus === "not-started" ? "Not Started" : 
                           goal.quarterlyStatus === "on-track" ? "On Track" : "Completed"}
                        </Badge>
                        {canEdit && !isEditing && (
                           <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)} className="h-8 gap-1">
                             <Edit className="h-4 w-4" /> Update
                           </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="grid gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Planned Target</Label>
                              <Input 
                                type="number" 
                                value={editValues.plannedTargetValue} 
                                onChange={(e) => {
                                  setEditValues({...editValues, plannedTargetValue: e.target.value});
                                  if (Number(e.target.value) < 0) setValidationErrors({...validationErrors, plannedTargetValue: "Cannot be negative"});
                                  else setValidationErrors({...validationErrors, plannedTargetValue: null});
                                }}
                              />
                              {validationErrors.plannedTargetValue && <span className="text-xs text-red-500">{validationErrors.plannedTargetValue}</span>}
                            </div>
                            <div className="space-y-2">
                              <Label>Actual Achievement</Label>
                              <Input 
                                type="number" 
                                value={editValues.actualAchievementValue} 
                                onChange={(e) => {
                                  setEditValues({...editValues, actualAchievementValue: e.target.value});
                                  if (Number(e.target.value) < 0) setValidationErrors({...validationErrors, actualAchievementValue: "Cannot be negative"});
                                  else setValidationErrors({...validationErrors, actualAchievementValue: null});
                                }}
                              />
                              {validationErrors.actualAchievementValue && <span className="text-xs text-red-500">{validationErrors.actualAchievementValue}</span>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                              <Label>Status</Label>
                              <select 
                                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none dark:border-slate-700 dark:bg-slate-900"
                                value={editValues.quarterlyStatus}
                                onChange={(e) => setEditValues({...editValues, quarterlyStatus: e.target.value})}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="on-track">On Track</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                              <Label>Tasks Completed ({editValues.tasksCompleted} / {editValues.numberOfTasks})</Label>
                              <div className="flex items-center gap-4 mt-2">
                                <input 
                                  type="range" 
                                  min="0" 
                                  max={editValues.numberOfTasks} 
                                  value={editValues.tasksCompleted} 
                                  onChange={(e) => handleTasksCompletedChange(Number(e.target.value))}
                                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm font-semibold">{editValues.progress}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleSave(goal._id)} disabled={loading || validationErrors.plannedTargetValue || validationErrors.actualAchievementValue} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Updates
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full flex-col gap-4 text-sm sm:flex-row">
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-slate-700 ">
                                Progress
                              </span>
                              <div className="text-right">
                                <span className="text-xs text-muted-foreground mr-2">
                                  {goal.tasksCompleted || 0} / {goal.numberOfTasks || 1} Tasks
                                </span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  {goal.progress || 0}%
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={goal.progress || 0}
                              className="h-2"
                            />
                            {goal.score > 0 && (
                              <div className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                KPI Score: {goal.score}
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-2 sm:min-w-[200px]">
                            <div className="flex items-center gap-1.5 text-foreground/80 ">
                              <span className="font-medium text-slate-500">Target:</span>{" "}
                              {goal.plannedTargetValue ?? "Not set"}
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground/80 ">
                              <span className="font-medium text-slate-500">Actual:</span>{" "}
                              {goal.actualAchievementValue ?? "Not set"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Manager Review Comments Section */}
                      <div className="mt-4 pt-4 border-t border-border">
                        {goal.approvalComments && (
                          <div className="rounded-xl bg-muted/50 p-4 text-sm text-foreground/80 flex items-start gap-3 border border-slate-100 mb-3">
                            <MessageSquare className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-semibold block text-foreground ">
                                Manager Check-in Note:
                              </span>
                              <p className="italic">"{goal.approvalComments}"</p>
                            </div>
                          </div>
                        )}
                        
                        {isManager && (
                          <div className="flex gap-2 items-start">
                            <Input 
                               placeholder="Add structured check-in comment (blockers, feedback...)"
                               value={commentValues[goal._id] || ""}
                               onChange={(e) => setCommentValues({...commentValues, [goal._id]: e.target.value})}
                               className="text-sm"
                            />
                            <Button 
                               size="sm" 
                               onClick={() => handleManagerComment(goal._id)}
                               disabled={!commentValues[goal._id] || loading}
                               className="shrink-0"
                            >
                               Post Note
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
