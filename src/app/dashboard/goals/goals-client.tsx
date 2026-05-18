"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  Edit,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";

export default function GoalsClient({ user }: { user: any }) {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  const [goals, setGoals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterManager, setFilterManager] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [approvalModalGoal, setApprovalModalGoal] = useState<any>(null);
  const [approvalModalStatus, setApprovalModalStatus] = useState<string>("");
  const [approvalComment, setApprovalComment] = useState("");
  const [approving, setApproving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    numberOfTasks: 1,
    goalWeightage: 10,
    deadline: "",
    team: "",
    assignedManager: "",
  });
  const [detailGoal, setDetailGoal] = useState<any>(null);
  const [formError, setFormError] = useState("");
  const currentUserTeamId = user.team?._id || user.team || "";
  const currentUserDepartment = user.department || "";

  function isActiveGoal(goal: any) {
    return goal.approvalStatus !== "Rejected" && goal.status !== "completed";
  }

  function canMutateGoal(goal: any) {
    if (user.role === "admin") return true;

    const goalTeamId = goal.team?._id || goal.team || "";
    const goalManagerId = goal.assignedManager?._id || goal.assignedManager || "";
    const creatorId = goal.creator?._id || goal.creator || "";
    const assignedToIds = (goal.assignedTo || []).map((entry: any) => entry?._id || entry || "");
    const contributingTeamIds = (goal.contributingTeams || []).map((entry: any) => entry?._id || entry || "");

    if (user.role === "manager") {
      return (
        goalManagerId === user.id ||
        goal.department === currentUserDepartment ||
        goalTeamId === currentUserTeamId
      );
    }

    if (goalTeamId) {
      return goalTeamId === currentUserTeamId || contributingTeamIds.includes(currentUserTeamId);
    }

    return creatorId === user.id || assignedToIds.includes(user.id);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalsRes, usersRes, teamsRes] = await Promise.all([
          fetch("/api/goals"),
          fetch("/api/users"),
          fetch("/api/teams"),
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

  useEffect(() => {
    if (selectedId && goals.length > 0) {
      const g = goals.find(goal => goal._id === selectedId);
      if (g) setDetailGoal(g);
    }
  }, [selectedId, goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      // Search
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        g.title.toLowerCase().includes(s) ||
        (g.creator?.name || "").toLowerCase().includes(s) ||
        g.approvalStatus.toLowerCase().includes(s);

      // Filters
      const matchesDept =
        filterDepartment === "all" ||
        (g.department || "").toLowerCase() === filterDepartment.toLowerCase() ||
        (g.creator?.department || "").toLowerCase() ===
          filterDepartment.toLowerCase();
      const matchesStatus =
        filterStatus === "all" ||
        g.status === filterStatus ||
        g.approvalStatus === filterStatus;
      const matchesManager =
        filterManager === "all" ||
        g.assignedManager?._id === filterManager ||
        g.assignedManager === filterManager;

      return matchesSearch && matchesDept && matchesStatus && matchesManager;
    });
  }, [goals, search, filterDepartment, filterStatus, filterManager]);

  const activeEmployeeGoalCount = useMemo(() => {
    if (user.role !== "employee") return 0;

    return goals.filter((goal) => {
      const goalTeamId = goal.team?._id || goal.team || "";
      const creatorId = goal.creator?._id || goal.creator || "";
      const assignedToIds = (goal.assignedTo || []).map((entry: any) => entry?._id || entry || "");

      return (
        isActiveGoal(goal) &&
        (creatorId === user.id || assignedToIds.includes(user.id) || goalTeamId === currentUserTeamId)
      );
    }).length;
  }, [goals, user.role, user.id, currentUserTeamId]);

  function getStatusDetails(status: string) {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle2,
          color: "text-emerald-500",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          border: "border-emerald-200 dark:border-emerald-500/20",
        };
      case "in-progress":
        return {
          label: "In Progress",
          icon: PlayCircle,
          color: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-500/10",
          border: "border-blue-200 dark:border-blue-500/20",
        };
      case "at-risk":
        return {
          label: "At Risk",
          icon: AlertCircle,
          color: "text-rose-500",
          bg: "bg-rose-50 dark:bg-rose-500/10",
          border: "border-rose-200 dark:border-rose-500/20",
        };
      default:
        return {
          label: "Not Started",
          icon: Clock,
          color: "text-muted-foreground",
          bg: "bg-muted/50 dark:bg-muted/500/10",
          border: "border-border ",
        };
    }
  }

  function getApprovalBadge(status: string) {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "Rejected":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "Pending Approval":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-muted text-slate-700 border-border dark:bg-slate-800 dark:text-muted-foreground ";
    }
  }

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setFormError("");
    setFormData({
      title: "",
      description: "",
      numberOfTasks: 1,
      goalWeightage: 10,
      deadline: "",
      team: "",
      assignedManager: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      numberOfTasks: goal.numberOfTasks || 1,
      goalWeightage: goal.goalWeightage ?? 10,
      deadline: goal.dueDate
        ? new Date(goal.dueDate).toISOString().split("T")[0]
        : "",
      team: goal.team?._id || goal.team || "",
      assignedManager: goal.assignedManager?._id || goal.assignedManager || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openApprovalModal = (
    goal: any,
    status: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setApprovalModalGoal(goal);
    setApprovalModalStatus(status);
    setApprovalComment("");
  };

  const handleApprove = async () => {
    if (!approvalModalGoal || !approvalModalStatus) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/goals/${approvalModalGoal._id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: approvalModalStatus,
          approvalComments: approvalComment,
        }),
      });
      if (res.ok) {
        const { goal: updatedGoal } = await res.json();
        setGoals(
          goals.map((g) =>
            g._id === approvalModalGoal._id
              ? {
                  ...g,
                  approvalStatus: updatedGoal.approvalStatus,
                  status: updatedGoal.status,
                  approvalComments: updatedGoal.approvalComments,
                  approvedBy: updatedGoal.approvedBy,
                }
              : g,
          ),
        );
        setDetailGoal((current: any) =>
          current && current._id === updatedGoal._id
            ? {
                ...current,
                approvalStatus: updatedGoal.approvalStatus,
                status: updatedGoal.status,
                approvalComments: updatedGoal.approvalComments,
                approvedBy: updatedGoal.approvedBy,
              }
            : current,
        );
        setApprovalModalGoal(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  const handleSave = async () => {
    setFormError("");
    if (!formData.deadline) {
      setFormError("Deadline is required.");
      return;
    }
    const parsedWeightage = Number(formData.goalWeightage || 0);
    if (Number.isNaN(parsedWeightage)) {
      setFormError("Goal weightage must be a number.");
      return;
    }
    if (parsedWeightage < 10) {
      setFormError("Each goal must have at least 10% weightage.");
      return;
    }
    if (parsedWeightage > 100) {
      setFormError("Goal weightage cannot exceed 100%.");
      return;
    }

    if (user.role === "employee") {
      const activeEmployeeGoals = goals.filter((goal) => {
        const goalTeamId = goal.team?._id || goal.team || "";
        const creatorId = goal.creator?._id || goal.creator || "";
        const assignedToIds = (goal.assignedTo || []).map((entry: any) => entry?._id || entry || "");
        return (
          isActiveGoal(goal) &&
          (creatorId === user.id || assignedToIds.includes(user.id) || goalTeamId === currentUserTeamId)
        );
      });

      if (!editingGoal && activeEmployeeGoals.length >= 8) {
        setFormError("Maximum 8 goals allowed per employee.");
        return;
      }

      if (formData.team && currentUserTeamId && formData.team !== currentUserTeamId) {
        setFormError("Employees can only create goals for their own team.");
        return;
      }
    }

    const parsedDeadline = new Date(formData.deadline);
    const currentDeadline = editingGoal?.dueDate ? new Date(editingGoal.dueDate).toISOString().split("T")[0] : null;

    if (!editingGoal || formData.deadline !== currentDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDeadline < today) {
        setFormError("Deadline cannot be set in the past.");
        return;
      }
    }
    if (!formData.assignedManager) {
      setFormError("Manager assignment is mandatory.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        goalWeightage: parsedWeightage,
        dueDate: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : null,
      };

      if (!payload.team) {
        delete (payload as any).team;
      }

      let res;
      if (editingGoal) {
        res = await fetch(`/api/goals/${editingGoal._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (editingGoal) {
          setGoals(
            goals.map((g) =>
              g._id === editingGoal._id ? { ...g, ...data.goal } : g,
            ),
          );
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

  const managers = users.filter(
    (u) => u.role === "manager" || u.role === "admin",
  );
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <DashboardShell
      title="Goals Overview"
      userName={user.name}
      avatar={user.avatar}
      roleLabel={user.roleLabel}
      role={user.role}
    >
      <div className="w-full min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground ">
              Team Goals
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-1">
              Manage, track, and approve objectives for your organization.
            </p>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <Button
              onClick={handleOpenCreate}
              disabled={user.role === "employee" && activeEmployeeGoalCount >= 8}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create Goal
            </Button>
          </div>
        </div>

        <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search goals by title, status, or owner..."
                className="pl-9 bg-card border-border w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="all">All Statuses</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              {user.role === "admin" && (
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              )}

              <select
                value={filterManager}
                onChange={(e) => setFilterManager(e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 max-w-[200px] truncate"
              >
                <option value="all">All Managers</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-xl overflow-hidden">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Table>
              <TableHeader className="bg-muted/20 dark:bg-slate-800/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[250px] font-semibold text-foreground/80 ">
                    Goal Name
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 ">
                    Approval
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 ">
                    Status
                  </TableHead>
                  <TableHead className="w-[150px] font-semibold text-foreground/80 ">
                    Progress
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 ">
                    Creator
                  </TableHead>
                  <TableHead className="w-[120px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-muted-foreground"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                      Loading goals...
                    </TableCell>
                  </TableRow>
                ) : filteredGoals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No goals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGoals.map((goal) => {
                    const status = getStatusDetails(goal.status);
                    const StatusIcon = status.icon;
                    return (
                      <TableRow
                        key={goal._id}
                        className="border-slate-100 hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => setDetailGoal(goal)}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground ">
                              {goal.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={null}
                            className={`font-medium border ${getApprovalBadge(goal.approvalStatus)}`}
                          >
                            {goal.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 pr-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {goal.progress}%
                              </span>
                            </div>
                            <Progress value={goal.progress} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground/80">
                          {goal.creator?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canMutateGoal(goal) ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleOpenEdit(goal, e)}
                                className="text-muted-foreground hover:text-indigo-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            ) : null}
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
          <div className="max-h-[calc(100vh-2rem)] w-[min(100vw-2rem,28rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl animate-in zoom-in-95 duration-200 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold tracking-tight text-foreground ">
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
                <Label>
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="E.g. Launch new feature"
                  className="bg-muted/50 "
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Details about the goal..."
                  className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Tasks</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.numberOfTasks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfTasks: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="bg-muted/50 "
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Goal Weightage <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    step="1"
                    value={formData.goalWeightage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goalWeightage: Math.max(10, Math.min(100, parseInt(e.target.value) || 10)),
                      })
                    }
                    className="bg-muted/50 "
                  />
                  <p className="text-xs text-muted-foreground">Each goal must contribute at least 10% and all active goals should total 100%.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    min={todayString}
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="bg-muted/50 "
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Assign Manager <span className="text-red-500">*</span>
                </Label>
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  value={formData.assignedManager}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedManager: e.target.value,
                    })
                  }
                >
                  <option value="">Select a Manager</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>
                  Assign Team <span className="text-red-500">*</span>
                </Label>
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  value={formData.team}
                  onChange={(e) =>
                    setFormData({ ...formData, team: e.target.value })
                  }
                >
                  <option value="">Select a Team</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              {!editingGoal && (
                <div className="space-y-2">
                  <Label className="text-xs text-amber-600 dark:text-amber-500">
                    Goal will be created as 'Pending Approval' for
                    Managers/Admins.
                  </Label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 ">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.title || saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {approvalModalGoal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="max-h-[calc(100vh-2rem)] w-[min(100vw-2rem,24rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl animate-in zoom-in-95 duration-200 sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-4">
              {approvalModalStatus === "Approved"
                ? "Approve Goal"
                : "Reject Goal"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Comments (Optional)</Label>
                <textarea
                  className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder={`Leave a comment for this ${approvalModalStatus.toLowerCase()}...`}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setApprovalModalGoal(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approving}
                className={
                  approvalModalStatus === "Approved"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {detailGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground ">
                  {detailGoal.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Created by {detailGoal.creator?.name || "Unknown"}
                </p>
              </div>
              <Badge
                variant={null}
                className={`font-medium border ${getApprovalBadge(detailGoal.approvalStatus)}`}
              >
                {detailGoal.approvalStatus}
              </Badge>
            </div>

            <div className="space-y-6">
              {detailGoal.description && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailGoal.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Status</h4>
                  <div className="text-sm text-muted-foreground">{detailGoal.status || "Not Started"}</div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Goal Weightage</h4>
                  <div className="text-sm text-muted-foreground">
                    {detailGoal.effectiveGoalWeightage ?? detailGoal.goalWeightage ?? 10}%
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Deadline</h4>
                  <div className="text-sm text-muted-foreground">
                    {detailGoal.dueDate
                      ? new Date(detailGoal.dueDate).toLocaleDateString()
                      : "No deadline"}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Tasks</h4>
                  <div className="text-sm text-muted-foreground">{detailGoal.numberOfTasks || 1} tasks planned</div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Task Contribution</h4>
                  <div className="text-sm text-muted-foreground">
                    {detailGoal.taskContributionWeight ?? Math.round(((detailGoal.effectiveGoalWeightage ?? detailGoal.goalWeightage ?? 10) / Math.max(detailGoal.numberOfTasks || 1, 1)) * 10) / 10}% per task
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Progress</h4>
                  <div className="text-sm text-muted-foreground">{detailGoal.progress || 0}%</div>
                  <Progress value={detailGoal.progress || 0} className="h-1.5 mt-1 w-full" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Manager</h4>
                  <div className="text-sm text-muted-foreground">{detailGoal.assignedManager?.name || "Unassigned"}</div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Team</h4>
                  <div className="text-sm text-muted-foreground">{detailGoal.team?.name || "No Team"}</div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Contribution Eligibility</h4>
                  <div className="text-sm text-muted-foreground">
                    {detailGoal.contributionPermissions?.includes("team-members")
                      ? "Team members only"
                      : "Restricted access"}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <h4 className="text-sm font-semibold text-foreground mb-2">Validation Info</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    Contributing teams: {detailGoal.contributingTeams?.length ? detailGoal.contributingTeams.length : 1}
                  </div>
                  <div>
                    Weighted contribution: {Math.round((detailGoal.progress || 0) * ((detailGoal.effectiveGoalWeightage ?? detailGoal.goalWeightage ?? 10) / 100))}%
                  </div>
                </div>
              </div>

              {detailGoal.approvalComments && (
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Approval Comments</h4>
                  <p className="text-sm text-muted-foreground">{detailGoal.approvalComments}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/50 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setDetailGoal(null)}>
                Close
              </Button>
              {(user.role === "admin" || (user.role === "manager" && (detailGoal.assignedManager?._id === user.id || detailGoal.assignedManager === user.id))) && (detailGoal.approvalStatus === "Pending Approval" || detailGoal.approvalStatus === "Draft") && (
                <>
                  <Button
                    onClick={(e) => {
                      setDetailGoal(null);
                      openApprovalModal(detailGoal, "Rejected", e);
                    }}
                    variant="outline"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={(e) => {
                      setDetailGoal(null);
                      openApprovalModal(detailGoal, "Approved", e);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
