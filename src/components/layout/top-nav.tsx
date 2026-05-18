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
import { ThemeToggle } from "@/components/theme-toggle";

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
          setUnreadCount(
            (data.notifications || []).filter((n: any) => !n.read).length,
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setUnreadCount(0);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", { method: "PUT" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-card/90 px-4 py-4 backdrop-blur-md sm:px-6">
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
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
              Welcome back, {userName}{" "}
              <span className="inline-block" aria-hidden>
                👋
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="relative hidden w-full max-w-xs lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="rounded-xl border-border bg-muted/50 pl-9 focus:bg-card dark:focus:bg-slate-950"
              placeholder="Search goals, teams..."
            />
          </div>
          {roleSwitcher}
          <Badge variant="slate" className="hidden sm:inline-flex">
            {roleLabel}
          </Badge>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl transition hover:bg-muted dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-foreground/80" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[300px] sm:w-80 max-w-[95vw]"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    const content = (
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-sm font-medium ${notif.read ? "text-foreground/80" : "text-foreground"}`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleDateString()
                            : "Just now"}
                        </span>
                      </div>
                    );
                    const desc = (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    );
                    const className = `block px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 hover:bg-muted ${notif.read ? "bg-card" : "bg-muted/20"}`;

                    return notif.link ? (
                      <Link
                        key={notif._id || Math.random()}
                        href={notif.link}
                        className={className}
                      >
                        {content}
                        {desc}
                      </Link>
                    ) : (
                      <div
                        key={notif._id || Math.random()}
                        className={className}
                      >
                        {content}
                        {desc}
                      </div>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-sm shadow-sm transition hover:border-slate-300">
                <Avatar className="h-8 w-8">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={userName}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {userName ? userName.slice(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="w-full cursor-pointer"
                >
                  Profile settings
                </Link>
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
