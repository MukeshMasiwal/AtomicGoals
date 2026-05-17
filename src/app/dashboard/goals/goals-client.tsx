"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, AlertCircle, CheckCircle2, Clock, PlayCircle, Edit, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function GoalsClient({ user }: { user: any }) {
  const [goals, setGoals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "not-started",
    progress: 0,
    priority: "Medium",
    deadline: "",
    assignedTo: [] as string[],
    team: "",
    assignedManager: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalsRes, usersRes, teamsRes] = await Promise.all([
          fetch("/api/goals"),
          fetch("/api/users"),
          fetch("/api/teams")
        ]);
        if (goalsRes.ok) {
          const data = await goalsRes.json();
          setGoals(data.goals);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users);
        }
        if (teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(data.teams);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredGoals = useMemo(() => {
    if (!search) return goals;
    const s = search.toLowerCase();
    return goals.filter(g => 
      g.title.toLowerCase().includes(s) || 
      (g.creator?.name || "").toLowerCase().includes(s) ||
      g.approvalStatus.toLowerCase().includes(s)
    );
  }, [goals, search]);

  function getStatusDetails(status: string) {
    switch (status?.toLowerCase()) {
      case "completed": return { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" };
      case "in-progress": return { label: "In Progress", icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" };
      case "at-risk": return { label: "At Risk", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20" };
      default: return { label: "Not Started", icon: Clock, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/20" };
    }
  }

  function getApprovalBadge(status: string) {
    switch (status) {
      case "Approved": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "Rejected": return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "Pending Approval": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  }

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setFormError("");
    setFormData({ title: "", description: "", status: "not-started", progress: 0, priority: "Medium", deadline: "", assignedTo: [], team: "", assignedManager: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      status: goal.status || "not-started",
      progress: goal.progress || 0,
      priority: goal.priority || "Medium",
      deadline: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : "",
      assignedTo: goal.assignedTo?.map((u: any) => u._id || u) || [],
      team: goal.team?._id || goal.team || "",
      assignedManager: goal.assignedManager?._id || goal.assignedManager || ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleApprove = async (goal: any, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/goals/${goal._id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: status })
      });
      if (res.ok) {
        const { goal: updatedGoal } = await res.json();
        setGoals(goals.map(g => g._id === goal._id ? { ...g, approvalStatus: updatedGoal.approvalStatus, status: updatedGoal.status } : g));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setFormError("");
    if (!formData.deadline) {
      setFormError("Deadline is required.");
      return;
    }
    const parsedDeadline = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDeadline < today) {
      setFormError("Deadline cannot be set in the past.");
      return;
    }
    if (!formData.assignedManager) {
      setFormError("Manager assignment is mandatory.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        dueDate: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      let res;
      if (editingGoal) {
        res = await fetch(`/api/goals/${editingGoal._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (editingGoal) {
          setGoals(goals.map(g => g._id === editingGoal._id ? { ...g, ...data.goal } : g));
        } else {
          // Add basic creator population mock for immediate UI update
          data.goal.creator = { name: user.name };
          setGoals([data.goal, ...goals]);
        }
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || "Failed to save goal");
      }
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const managers = users.filter(u => u.role === "manager" || u.role === "admin");
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <DashboardShell title="Goals Overview" userName={user.name} avatar={user.avatar} roleLabel={user.roleLabel} role={user.role}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Team Goals</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage, track, and approve objectives for your organization.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button onClick={handleOpenCreate} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Create Goal
            </Button>
          </div>
        </div>

        <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search goals by title or owner..." 
                className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[250px] font-semibold text-slate-600 dark:text-slate-300">Goal Name</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Approval</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                  <TableHead className="w-[150px] font-semibold text-slate-600 dark:text-slate-300">Progress</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Creator</TableHead>
                  <TableHead className="w-[120px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                      Loading goals...
                    </TableCell>
                  </TableRow>
                ) : filteredGoals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      No goals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGoals.map((goal) => {
                    const status = getStatusDetails(goal.status);
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={goal._id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {goal.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={null} className={`font-medium border ${getApprovalBadge(goal.approvalStatus)}`}>
                            {goal.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 pr-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {goal.creator?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {(user.role === "admin" || user.role === "manager") && goal.approvalStatus === "Pending Approval" && (
                              <>
                                <Button variant="ghost" size="icon" onClick={(e) => handleApprove(goal, "Approved", e)} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => handleApprove(goal, "Rejected", e)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" onClick={(e) => handleOpenEdit(goal, e)} className="text-slate-400 hover:text-indigo-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                {editingGoal ? "Edit Goal" : "Create Goal"}
              </h3>
            </div>
            <div className="grid gap-4 py-4">
              {formError && (
                <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. Launch new feature" className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900"
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="at-risk">At Risk</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select 
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900"
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Progress (%)</Label>
                  <Input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: Number(e.target.value)})} className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label>Deadline <span className="text-red-500">*</span></Label>
                  <Input type="date" min={todayString} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign Manager <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                  value={formData.assignedManager} 
                  onChange={e => setFormData({...formData, assignedManager: e.target.value})}
                >
                  <option value="">Select a Manager</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Assign Team</Label>
                <select 
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                  value={formData.team} 
                  onChange={e => setFormData({...formData, team: e.target.value})}
                >
                  <option value="">None</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Assign User</Label>
                <select 
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                  value={formData.assignedTo[0] || ""} 
                  onChange={e => setFormData({...formData, assignedTo: [e.target.value]})}
                >
                  <option value="">None</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              {!editingGoal && (
                <div className="space-y-2">
                  <Label className="text-xs text-amber-600 dark:text-amber-500">Goal will be created as 'Pending Approval' for Managers/Admins.</Label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.title || saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
