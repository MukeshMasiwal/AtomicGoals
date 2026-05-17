"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

import { Logo } from "@/components/ui/logo";

type TopNavProps = {
  title: string;
  roleLabel: string;
  userName: string;
  avatar?: string;
  roleSwitcher?: React.ReactNode;
  onToggleSidebar?: () => void;
};

export default function TopNav({
  title,
  roleLabel,
  userName,
  avatar,
  roleSwitcher,
  onToggleSidebar,
}: TopNavProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount((data.notifications || []).filter((n: any) => !n.read).length);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setUnreadCount(0);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", { method: "PUT" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo showText={false} />
          </div>
          <div className="min-w-0 hidden lg:block">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif._id || Math.random()} className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 ${notif.read ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</span>
                        <span className="text-xs text-slate-400">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm transition hover:border-slate-300">
                <Avatar className="h-8 w-8">
                  {avatar ? (
                    <img src={avatar} alt={userName} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {userName ? userName.slice(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="w-full cursor-pointer">Profile settings</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
