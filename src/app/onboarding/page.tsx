"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Status = "idle" | "loading" | "success" | "error";

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const [managers, setManagers] = useState<
    { _id: string; name: string; department: string }[]
  >([]);
  const [teams, setTeams] = useState<
    { _id: string; name: string; department: string }[]
  >([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/onboarding/data");
        if (res.ok) {
          const data = await res.json();
          setManagers(data.managers || []);
          setTeams(data.teams || []);
        }
      } catch (error) {
        console.error("Failed to fetch onboarding data", error);
      }
    }
    fetchData();
  }, []);

  const availableTeams = teams.filter((t) => t.department === department);

  async function handleOnboarding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firstName || !lastName || !jobTitle) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          jobTitle,
          department,
          manager: selectedManager,
          team: selectedTeam,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to save profile.");
        return;
      }

      setStatus("success");
      setMessage("Profile setup complete! Redirecting to dashboard...");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl ">
          <CardHeader className="space-y-4 pb-6 flex flex-col items-center text-center">
            <Logo className="mb-2" />
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Welcome to AtomicGoals
              </CardTitle>
              <CardDescription className="text-base">
                Let's set up your profile to get you started.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleOnboarding} className="space-y-6">
              {status === "error" && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
                  {message}
                </div>
              )}
              {status === "success" && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400">
                  {message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-transparent"
                    disabled={status === "loading" || status === "success"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-transparent"
                    disabled={status === "loading" || status === "success"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Product Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="bg-transparent"
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setSelectedTeam("");
                  }}
                  className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-950 dark:placeholder:text-muted-foreground dark:focus-visible:ring-slate-300"
                  disabled={status === "loading" || status === "success"}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <select
                    id="manager"
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    disabled={status === "loading" || status === "success"}
                  >
                    <option value="" disabled>
                      Select Manager
                    </option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <select
                    id="team"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    disabled={status === "loading" || status === "success"}
                  >
                    <option value="" disabled>
                      Select Team
                    </option>
                    {availableTeams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                disabled={
                  status === "loading" ||
                  status === "success" ||
                  !firstName ||
                  !lastName ||
                  !jobTitle ||
                  !selectedManager ||
                  !selectedTeam
                }
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving profile...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
