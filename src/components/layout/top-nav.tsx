"use client";

import { Bell, ChevronDown, Menu, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type TopNavProps = {
  title: string;
  roleLabel: string;
  userName: string;
  roleSwitcher?: React.ReactNode;
  onToggleSidebar?: () => void;
};

export default function TopNav({
  title,
  roleLabel,
  userName,
  roleSwitcher,
  onToggleSidebar,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {title}
            </p>
            <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
              Welcome back, {userName}{" "}
              <span className="inline-block" aria-hidden>
                👋
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="relative hidden w-full max-w-xs lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="rounded-xl border-slate-200 bg-slate-50 pl-9 focus:bg-white"
              placeholder="Search goals, teams..."
            />
          </div>
          {roleSwitcher}
          <Badge variant="slate" className="hidden sm:inline-flex">
            {roleLabel}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm transition hover:border-slate-300">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile settings</DropdownMenuItem>
              <DropdownMenuItem>Team preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
