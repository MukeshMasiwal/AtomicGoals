"use client";

import { useState } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Palette, Shield, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Hardcoded for demo UI. In reality, you'd fetch the user session from context or API.
  const role = "manager";
  const name = "Demo User";

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <DashboardShell
      title="Account Settings"
      userName={name}
      roleLabel="Manager"
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
            <Button variant="ghost" className="justify-start text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button variant="ghost" className="justify-start text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </Button>
            <Button variant="ghost" className="justify-start text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Jane" className="bg-white dark:bg-slate-950" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" className="bg-white dark:bg-slate-950" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="jane.doe@ihgst.com" className="bg-white dark:bg-slate-950" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Job Title / Role</Label>
                  <Input id="role" defaultValue="Senior Manager" disabled className="bg-slate-50 dark:bg-slate-900" />
                  <p className="text-[10px] text-slate-500">Your role must be changed by an Administrator.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
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
