"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, Mail, MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, teamsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/teams")
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

  const filteredUsers = users.filter((u) => {
    if (user.role === "employee" && u.team !== user.team) {
      return false; // Employees only see their own team
    }
    if (!search) return true;
    const s = search.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s);
  });

  const handleCreateTeam = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName, members: selectedMembers })
      });
      if (res.ok) {
        const data = await res.json();
        setTeams([...teams, data.team]);
        // Also update local users state to reflect team assignment
        setUsers(users.map(u => selectedMembers.includes(u.id) ? { ...u, team: data.team._id } : u));
        setIsModalOpen(false);
        setNewTeamName("");
        setSelectedMembers([]);
      }
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
        setUsers(users.map(u => u.id === userId ? { ...u, team: null } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "manager": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  }

  return (
    <DashboardShell title="Team Directory" userName={user.name} avatar={user.avatar} roleLabel={user.roleLabel} role={user.role}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Team Directory</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage your organization's team members.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-slate-900">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            {user.role !== "employee" && (
              <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                <Plus className="h-4 w-4" /> Create Team
              </Button>
            )}
          </div>
        </div>

        <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team members by name or email..." 
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
                  <TableHead className="w-[300px] font-semibold text-slate-600 dark:text-slate-300">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Role</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Department</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Team</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" /> Loading directory...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-slate-500">No members found.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((member) => (
                    <TableRow key={member.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-semibold">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{member.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{member.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={null} className={`font-medium border capitalize ${getRoleBadge(member.role)}`}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {member.department || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {teams.find(t => t._id === member.team)?.name || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                            <Mail className="h-4 w-4" />
                          </Button>
                          {(user.role === "admin" || user.role === "manager") && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-red-600 cursor-pointer"
                                  onClick={() => handleRemoveFromTeam(member.id)}
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
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Create New Team</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. Marketing Pod A" className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label>Select Members</Label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md p-2 bg-slate-50 dark:bg-slate-900">
                  {users.filter(u => u.role !== "admin").map(u => (
                    <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedMembers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedMembers([...selectedMembers, u.id]);
                          else setSelectedMembers(selectedMembers.filter(id => id !== u.id));
                        }}
                      />
                      <span className="text-sm">{u.name} ({u.email})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTeam} disabled={!newTeamName || saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
