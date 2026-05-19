"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  MoreHorizontal,
  Plus,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TeamClient({ user }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newTeamName, setNewTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const maxTeamMembers = 8;
  const [selectedManagerId, setSelectedManagerId] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const approvalUserId = searchParams.get("approvalUser");
  
  const [approvalUser, setApprovalUser] = useState<any>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalTeamId, setApprovalTeamId] = useState("");
  const [approvalManagerId, setApprovalManagerId] = useState("");

  const managedTeam = teams.find(
    (t) => String((t.manager as any)?._id || t.manager) === user.id,
  );
  const teamIdForView =
    user.team || (managedTeam?._id ? String(managedTeam._id) : "");
  const currentTeam = teams.find((t) => String(t._id) === teamIdForView);
  const currentTeamCount = currentTeam
    ? (currentTeam.members?.length || 0) + (currentTeam.manager ? 1 : 0)
    : 0;
  const isManagerAddMembers = user.role === "manager" && !!managedTeam;
  const managerIdForCreate = user.role === "admin" ? selectedManagerId : user.id;
  const normalizedSelectedMembers = selectedMembers.filter(
    (id) => id !== managerIdForCreate,
  );
  const selectedCount =
    normalizedSelectedMembers.length + (managerIdForCreate ? 1 : 0);
  const limitReached = selectedCount >= maxTeamMembers;
  const approvalTeam = teams.find((t) => String(t._id) === approvalTeamId);
  const approvalTeamCount = approvalTeam
    ? (approvalTeam.members?.length || 0) + (approvalTeam.manager ? 1 : 0)
    : 0;
  const approvalUserTeamId = approvalUser?.team
    ? String(approvalUser.team)
    : "";
  const approvalLimitReached = approvalTeamId
    ? approvalTeamCount >= maxTeamMembers && approvalUserTeamId !== approvalTeamId
    : false;
  const approvalReady =
    user.role === "admin"
      ? !!approvalTeamId && !!approvalManagerId && !approvalLimitReached
      : !approvalLimitReached;

  useEffect(() => {
    if (approvalUserId && users.length > 0) {
      const userToApprove = users.find((u) => u.id === approvalUserId);
      if (userToApprove) {
        setApprovalUser(userToApprove);
      } else {
        // If not in standard users list (maybe pending users are filtered?), fetch individually
        fetch(`/api/users/${approvalUserId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.user) setApprovalUser(data.user);
          })
          .catch(console.error);
      }
    }
  }, [approvalUserId, users]);

  const handleApprovalAction = async (action: "approve" | "reject") => {
    if (!approvalUser) return;
    setApprovalLoading(true);
    try {
      const res = await fetch(`/api/users/${approvalUser.id || approvalUser._id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          teamId: approvalTeamId,
          managerId: approvalManagerId,
        }),
      });
      if (res.ok) {
        // Refresh users + teams
        const [usersRes, teamsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/teams"),
        ]);
        if (usersRes.ok) {
          const updatedUsers = await usersRes.json();
          if (updatedUsers.users) setUsers(updatedUsers.users);
        }
        if (teamsRes.ok) {
          const updatedTeams = await teamsRes.json();
          if (updatedTeams.teams) setTeams(updatedTeams.teams);
        }
        setApprovalUser(null);
        router.replace("/dashboard/team");
      } else {
        const data = await res.json().catch(() => ({}));
        if (data?.error) {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, teamsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/teams"),
        ]);
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
        }
        if (teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(data.teams || []);
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
    if (!isModalOpen) return;
    if (user.role === "admin") {
      const defaultManager = users.find(
        (u) => u.role === "manager" || u.role === "admin",
      );
      if (defaultManager) setSelectedManagerId(defaultManager.id);
      setNewTeamName("");
    } else {
      setSelectedManagerId(user.id);
      if (managedTeam?.name) {
        setNewTeamName(managedTeam.name);
      }
    }
  }, [isModalOpen, user.role, users, user.id, managedTeam]);

  useEffect(() => {
    if (!approvalUser) return;

    if (user.role === "admin") {
      const deptTeam = teams.find(
        (t) => t.department && t.department === approvalUser.department,
      );
      const fallbackTeam = teams[0];
      const teamToUse = deptTeam || fallbackTeam;
      setApprovalTeamId(teamToUse?._id ? String(teamToUse._id) : "");

      const managerOptions = users.filter(
        (u) => u.role === "manager" || u.role === "admin",
      );
      const deptManager = managerOptions.find(
        (u) => u.department && u.department === approvalUser.department,
      );
      const managerToUse = deptManager || managerOptions[0];
      setApprovalManagerId(managerToUse?.id || "");
      return;
    }

    if (user.role === "manager") {
      if (managedTeam?._id) {
        setApprovalTeamId(String(managedTeam._id));
      }
      setApprovalManagerId(user.id);
    }
  }, [approvalUser, user.role, teams, users, managedTeam, user.id]);

  const filteredUsers = users.filter((u) => {
    if (user.role !== "admin") {
      if (!teamIdForView) {
        return u.id === user.id;
      }
      if (u.team !== teamIdForView && u.id !== user.id) {
        return false;
      }
    }
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s)
    );
  });

  const handleCreateTeam = async () => {
    setSaving(true);
    try {
      if (limitReached) {
        alert("Team limit reached (8/8 members).");
        return;
      }

      if (isManagerAddMembers && managedTeam?._id) {
        const memberIds = normalizedSelectedMembers;
        const responses = await Promise.all(
          memberIds.map((memberId) =>
            fetch(`/api/users/${memberId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ team: managedTeam._id }),
            }),
          ),
        );

        const failed = responses.find((r) => !r.ok);
        if (failed) {
          const data = await failed.json().catch(() => ({}));
          if (data?.error) alert(data.error);
          return;
        }
      } else {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newTeamName,
            members: normalizedSelectedMembers,
            managerId: managerIdForCreate,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.error) alert(data.error);
          return;
        }
      }

      const [usersRes, teamsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/teams"),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.teams || []);
      }

      setIsModalOpen(false);
      setNewTeamName("");
      setSelectedMembers([]);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromTeam = async (userId: string) => {
    if (!confirm("Remove this user from their team?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: null }),
      });
      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, team: null } : u)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-muted text-slate-700 dark:bg-slate-800 dark:text-muted-foreground border-border ";
    }
  }

  return (
    <DashboardShell
      title="Team Directory"
      userName={user.name}
      avatar={user.avatar}
      roleLabel={user.roleLabel}
      role={user.role}
    >
      <div className="w-full min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground ">
              Team Directory
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-1">
              View and manage your organization's team members.
            </p>
            {user.role !== "admin" && teamIdForView && (
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                Team members: {currentTeamCount}/{maxTeamMembers}
                {currentTeamCount >= maxTeamMembers
                  ? " (Team limit reached)"
                  : ""}
              </p>
            )}
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            {user.role !== "employee" && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" /> Create Team
              </Button>
            )}
          </div>
        </div>

        <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-xl ">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team members by name or email..."
                className="pl-9 bg-card border-border "
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-xl overflow-hidden">
          <div className="hidden md:block -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Table>
              <TableHeader className="bg-muted/20 dark:bg-slate-800/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[300px] font-semibold text-foreground/80 ">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 ">
                    Role
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 ">
                    Department
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 ">
                    Team
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 ">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground/80 ">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-muted-foreground"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />{" "}
                      Loading directory...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="border-slate-100 hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border ">
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-semibold">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground ">
                              {member.name}
                            </span>
                            <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={null}
                          className={`font-medium border capitalize ${getRoleBadge(member.role)}`}
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80 dark:text-muted-foreground">
                        {member.department || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80 dark:text-muted-foreground">
                        {teams.find((t) => t._id === member.team)?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            member.approvalStatus === "Pending Approval"
                              ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                              : member.status === "Active"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
                          }
                          variant={null}
                        >
                          {member.approvalStatus === "Pending Approval" ? "Pending Approval" : member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(user.role === "admin" ||
                            user.role === "manager") && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.approvalStatus === "Pending Approval" && (
                                  <DropdownMenuItem
                                    className="text-emerald-600 cursor-pointer"
                                    onClick={() => setApprovalUser(member)}
                                  >
                                    Review & Approve
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer"
                                  onClick={() =>
                                    handleRemoveFromTeam(member.id)
                                  }
                                >
                                  Remove from Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-4 p-4">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading directory...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No members found.
              </div>
            ) : (
              filteredUsers.map((member) => (
                <div key={member.id} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{member.name}</span>
                        <span className="text-[11px] text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {(user.role === "admin" || user.role === "manager") && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.approvalStatus === "Pending Approval" && (
                              <DropdownMenuItem className="text-emerald-600 cursor-pointer" onClick={() => setApprovalUser(member)}>
                                Review & Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleRemoveFromTeam(member.id)}>
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Role</span>
                      <span className="text-xs text-foreground capitalize">{member.role}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Department</span>
                      <span className="text-xs text-foreground">{member.department || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Team</span>
                      <span className="text-xs text-foreground">{teams.find((t) => t._id === member.team)?.name || "—"}</span>
                    </div>
                    <div className="flex flex-col items-start pt-1">
                      <Badge
                        className={member.approvalStatus === "Pending Approval" ? "bg-amber-100 text-amber-700 border-amber-200 text-[10px]" : member.status === "Active" ? "bg-emerald-100 text-emerald-700 text-[10px]" : "bg-slate-100 text-slate-700 text-[10px]"}
                        variant={null}
                      >
                        {member.approvalStatus === "Pending Approval" ? "Pending Approval" : member.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="flex flex-col max-h-[85vh] sm:max-h-[calc(100vh-2rem)] w-full sm:w-[min(100vw-2rem,28rem)] rounded-t-2xl sm:rounded-xl border border-border bg-card shadow-xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 pb-3 border-b border-border/50 shrink-0">
              <h3 className="text-lg font-semibold tracking-tight text-foreground ">
                {isManagerAddMembers
                  ? `Add Members to ${managedTeam?.name || "Team"}`
                  : "Create New Team"}
              </h3>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
              {!isManagerAddMembers && (
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Marketing Pod A"
                    className="bg-muted/50 "
                  />
                </div>
              )}

              {user.role === "admin" && (
                <div className="space-y-2">
                  <Label>Assign Manager</Label>
                  <select
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="" disabled>
                      Select manager
                    </option>
                    {users
                      .filter((u) => u.role === "manager" || u.role === "admin")
                      .map((u) => (
                        <option
                          key={u.id}
                          value={u.id}
                          className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                        >
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Select Members</Label>
                <div className="max-h-48 overflow-y-auto border border-border rounded-md p-2 bg-muted/50 ">
                  {users
                    .filter((u) => u.role !== "admin" && u.id !== selectedManagerId)
                    .map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(u.id)}
                          disabled={limitReached && !selectedMembers.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers((prevMembers) =>
                                prevMembers.includes(u.id)
                                  ? prevMembers
                                  : [...prevMembers, u.id],
                              );
                            } else {
                              setSelectedMembers((prevMembers) =>
                                prevMembers.filter((id) => id !== u.id),
                              );
                            }
                          }}
                        />
                        <span className="text-sm">
                          {u.name} ({u.email})
                        </span>
                      </label>
                    ))}
                </div>
                <p className={`text-xs ${limitReached ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}>
                  {limitReached
                    ? `Team limit reached (${selectedCount}/${maxTeamMembers} members)`
                    : `Selected ${selectedCount}/${maxTeamMembers} members`}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 sm:p-5 border-t border-border bg-muted/20 shrink-0 sm:rounded-b-xl">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={
                  saving ||
                  limitReached ||
                  (isManagerAddMembers
                    ? normalizedSelectedMembers.length === 0
                    : !newTeamName || (user.role === "admin" && !selectedManagerId))
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  isManagerAddMembers ? "Add Members" : "Create"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="flex flex-col max-h-[85vh] sm:max-h-[calc(100vh-2rem)] w-full sm:w-[min(100vw-2rem,28rem)] rounded-t-2xl sm:rounded-xl border border-border bg-card shadow-xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="mb-4 text-center">
              <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300">
                    {approvalUser.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground ">
                Approve New Employee
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Review the application details below.
              </p>
            </div>
            
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg mb-6 border border-border/50">
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                <span className="text-muted-foreground font-medium">Name:</span>
                <span className="col-span-2 font-medium text-foreground">{approvalUser.name}</span>
                
                <span className="text-muted-foreground font-medium">Email:</span>
                <span className="col-span-2 text-foreground">{approvalUser.email}</span>
                
                <span className="text-muted-foreground font-medium">Role:</span>
                <span className="col-span-2 capitalize text-foreground">{approvalUser.role}</span>
                
                <span className="text-muted-foreground font-medium">Department:</span>
                <span className="col-span-2 text-foreground">{approvalUser.department || "N/A"}</span>
                
                <span className="text-muted-foreground font-medium">Status:</span>
                <span className="col-span-2">
                  <Badge variant={null} className="border text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                    {approvalUser.approvalStatus || "Pending Approval"}
                  </Badge>
                </span>
              </div>
            </div>

            {user.role === "admin" && (
              <div className="space-y-3 mb-6">
                <div className="space-y-2">
                  <Label>Assign Team</Label>
                  <select
                    value={approvalTeamId}
                    onChange={(e) => setApprovalTeamId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="" disabled>
                      Select team
                    </option>
                    {teams.map((t) => (
                      <option
                        key={t._id}
                        value={t._id}
                        className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Manager</Label>
                  <select
                    value={approvalManagerId}
                    onChange={(e) => setApprovalManagerId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="" disabled>
                      Select manager
                    </option>
                    {users
                      .filter(
                        (u) => u.role === "manager" || u.role === "admin",
                      )
                      .map((u) => (
                        <option
                          key={u.id}
                          value={u.id}
                          className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                        >
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
                <p
                  className={`text-xs ${approvalLimitReached ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}
                >
                  {approvalTeamId
                    ? `Team members: ${approvalTeamCount}/${maxTeamMembers}`
                    : "Select a team to see member count."}
                  {approvalLimitReached ? " (Team limit reached)" : ""}
                </p>
              </div>
            )}

            {user.role === "manager" && managedTeam && (
              <div className="mb-6 text-xs text-muted-foreground">
                Assigning to {managedTeam.name} (managed by you).
              </div>
            )}

            </div>
            <div className="flex justify-center gap-3 p-4 sm:p-5 border-t border-border bg-muted/20 shrink-0 sm:rounded-b-xl">
              <Button
                variant="outline"
                className="w-40 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                onClick={() => handleApprovalAction("reject")}
                disabled={approvalLoading}
              >
                Reject
              </Button>
              <Button
                className="w-40 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                onClick={() => handleApprovalAction("approve")}
                disabled={approvalLoading || !approvalReady}
              >
                {approvalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Approve Access"
                )}
              </Button>
            </div>
            
            <button 
              onClick={() => {
                setApprovalUser(null);
                router.replace("/dashboard/team");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10 bg-card/50 rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
