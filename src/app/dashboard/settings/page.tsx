"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Palette, Shield, LogOut, Loader2, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState("employee");
  const [department, setDepartment] = useState("Engineering");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const { user } = await res.json();
          const nameParts = (user.name || "").split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
          setEmail(user.email || "");
          setJobTitle(user.jobTitle || "");
          setRole(user.role || "employee");
          setDepartment(user.department || "Engineering");
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, jobTitle, department }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const displayRoleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const displayName = `${firstName} ${lastName}`.trim();

  return (
    <DashboardShell
      title="Account Settings"
      userName={displayName || "User"}
      avatar=""
      roleLabel={displayRoleLabel}
      role={role as any}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account settings, preferences, and notifications.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[250px_1fr]">
          
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Link href="/dashboard/team/preferences">
              <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <Target className="mr-2 h-4 w-4" />
                Team Preferences
              </Button>
            </Link>
            <Button variant="ghost" className="justify-start text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button variant="ghost" className="justify-start text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {message.text && (
                  <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {message.text}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-white dark:bg-slate-950" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-white dark:bg-slate-950" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} disabled className="bg-slate-50 dark:bg-slate-900" />
                  <p className="text-[10px] text-slate-500">Your email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="bg-white dark:bg-slate-950" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                  >
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={displayRoleLabel} disabled className="bg-slate-50 dark:bg-slate-900" />
                  <p className="text-[10px] text-slate-500">Your role must be changed by an Administrator.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                <CardDescription>Actions related to your account security and session.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging out...</>
                  ) : (
                    <><LogOut className="mr-2 h-4 w-4" /> Sign Out</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
