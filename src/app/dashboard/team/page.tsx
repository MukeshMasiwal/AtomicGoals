import DashboardShell from "@/components/layout/dashboard-shell";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockTeam = [
  { id: "1", name: "Alice Johnson", email: "alice@ihgst.com", role: "Manager", department: "Engineering", status: "Active", initials: "AJ" },
  { id: "2", name: "Bob Smith", email: "bob@ihgst.com", role: "Employee", department: "Engineering", status: "Active", initials: "BS" },
  { id: "3", name: "Charlie Davis", email: "charlie@ihgst.com", role: "Employee", department: "Design", status: "On Leave", initials: "CD" },
  { id: "4", name: "Diana Prince", email: "diana@ihgst.com", role: "Admin", department: "Operations", status: "Active", initials: "DP" },
  { id: "5", name: "Evan Wright", email: "evan@ihgst.com", role: "Employee", department: "Marketing", status: "Active", initials: "EW" },
];

function getRoleBadge(role: string) {
  switch (role) {
    case "Admin": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    case "Manager": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
}

export default async function TeamPage() {
  const session = await getSessionFromCookies();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="Team Directory"
      userName={session.name || "User"}
      roleLabel={session.role === "admin" ? "Administrator" : session.role === "manager" ? "Manager" : "Employee"}
      role={session.role}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Team Directory</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage your organization's team members.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-slate-900">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            {session.role !== "employee" && (
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                Invite Member
              </Button>
            )}
          </div>
        </div>

        <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
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
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTeam.map((member) => (
                  <TableRow key={member.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                          <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-semibold">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{member.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{member.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={null} className={`font-medium border ${getRoleBadge(member.role)}`}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {member.department}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${member.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{member.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
