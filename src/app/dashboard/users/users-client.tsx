"use client";

import { useState, useEffect } from "react";
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
import { Search, Loader2, Shield, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UsersClient({ sessionUser }: { sessionUser: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This cannot be undone.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        alert("Failed to delete user.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (departmentFilter !== "All" && u.department !== departmentFilter)
      return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
    );
  });

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-muted text-slate-700 border-border";
    }
  }

  return (
    <DashboardShell
      title="User Management"
      userName={sessionUser.name}
      avatar=""
      roleLabel={sessionUser.roleLabel}
      role={sessionUser.role}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              User Management
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Admin control center for users, roles, and assignments.
            </p>
          </div>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-9"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="flex h-10 w-full sm:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Management">Management</option>
            </select>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="w-[250px] font-semibold text-foreground/80">
                    User
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Role
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Department
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Team
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Manager
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground/80">
                    Manage
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-muted-foreground"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />{" "}
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow
                      key={u.id}
                      className="border-slate-100 hover:bg-muted/20 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-semibold">
                              {u.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {u.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          disabled={u.id === sessionUser.id}
                          className="text-sm rounded border border-slate-200 bg-white px-2 py-1 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        {u.department || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        <select
                          value={u.team || ""}
                          onChange={async (e) => {
                            const newTeam = e.target.value;
                            const res = await fetch(`/api/users/${u.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ team: newTeam || null }),
                            });
                            if (res.ok) {
                              setUsers(
                                users.map((user) =>
                                  user.id === u.id
                                    ? { ...user, team: newTeam }
                                    : user,
                                ),
                              );
                            }
                          }}
                          className="text-sm rounded border border-slate-200 bg-white px-2 py-1 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="">No Team</option>
                          {teams.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge
                            className={
                              u.approvalStatus === "Pending Approval"
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : u.accountStatus === "Active"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            }
                            variant={null}
                          >
                            {u.approvalStatus === "Pending Approval" ? "Pending Approval" : u.accountStatus}
                          </Badge>
                          <select
                            value={u.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              const res = await fetch(`/api/users/${u.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  employeeStatus: newStatus,
                                }),
                              });
                              if (res.ok) {
                                setUsers(
                                  users.map((user) =>
                                    user.id === u.id
                                      ? { ...user, status: newStatus }
                                      : user,
                                  ),
                                );
                              }
                            }}
                            className="text-xs rounded border border-slate-200 bg-white px-2 py-1 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          >
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                          </select>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        <select
                          value={u.manager || ""}
                          onChange={async (e) => {
                            const newManager = e.target.value;
                            const res = await fetch(`/api/users/${u.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                manager: newManager || null,
                              }),
                            });
                            if (res.ok) {
                              setUsers(
                                users.map((user) =>
                                  user.id === u.id
                                    ? { ...user, manager: newManager }
                                    : user,
                                ),
                              );
                            }
                          }}
                          className="text-sm rounded border border-slate-200 bg-white px-2 py-1 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="">No Manager</option>
                          {users
                            .filter(
                              (user) =>
                                user.role === "manager" ||
                                user.role === "admin",
                            )
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === sessionUser.id}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
