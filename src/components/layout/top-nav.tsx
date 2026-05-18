"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  CheckCircle,
  XCircle,
  UserPlus,
  Users,
  CalendarClock,
  Target,
  FileText
} from "lucide-react";

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

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Goal Created':
      return <Target className="h-4 w-4 text-blue-500" />;
    case 'Goal Approved':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'Goal Rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'Task Completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Team Updated':
      return <Users className="h-4 w-4 text-indigo-500" />;
    case 'Team Member Added':
      return <UserPlus className="h-4 w-4 text-purple-500" />;
    case 'Employee Approved':
      return <UserPlus className="h-4 w-4 text-teal-500" />;
    case 'Quarterly Reminder':
      return <CalendarClock className="h-4 w-4 text-orange-500" />;
    default:
      return <FileText className="h-4 w-4 text-slate-500" />;
  }
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
    const controller = new AbortController();
    let active = true;

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications", {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        });

        if (!active) return;

        if (!res.ok) {
          if (res.status === 401) {
            setNotifications([]);
            setUnreadCount(0);
            return;
          }

          throw new Error(`Notifications request failed: ${res.status}`);
        }

        const data = await res.json();
        if (!active) return;

        setNotifications(data.notifications || []);
        setUnreadCount(
          (data.notifications || []).filter((n: any) => !n.isRead).length,
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn("[TopNav] notifications unavailable", err);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications", { method: "PUT" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif?._id) return;
    
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
    );
    if (!notif.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif._id }),
        });
      } catch (err) {
        console.error(err);
      }
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
              className="w-[350px] sm:w-[400px] max-w-[95vw] p-0 overflow-hidden rounded-xl border border-border shadow-lg"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <span className="font-semibold text-sm">Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                  </div>
                ) : (
                  <>
                    {/* Unread Section */}
                    {notifications.filter((n) => !n.isRead).length > 0 && (
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/10 border-b border-border/50">
                        New
                      </div>
                    )}
                    {notifications
                      .filter((n) => !n.isRead)
                      .map((notif: any) => {
                        const content = (
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 flex-shrink-0 p-1.5 rounded-full bg-primary/10`}>
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-sm font-medium truncate text-foreground">
                                  {notif.title}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                                  {notif.createdAt
                                    ? new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                    : "Just now"}
                                </span>
                              </div>
                              <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        );
                        const className = "block px-4 py-3 transition-colors cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted bg-primary/[0.03] border-l-2 border-l-primary";

                        return notif.link ? (
                          <Link
                            key={notif._id}
                            href={notif.link}
                            className={className}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div
                            key={notif._id}
                            className={className}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            {content}
                          </div>
                        );
                      })}

                    {/* Read Section */}
                    {notifications.filter((n) => n.isRead).length > 0 && (
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/10 border-b border-border/50">
                        Earlier
                      </div>
                    )}
                    {notifications
                      .filter((n) => n.isRead)
                      .map((notif: any) => {
                        const content = (
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 p-1.5 rounded-full bg-muted">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-sm font-medium truncate text-foreground/70">
                                  {notif.title}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                                  {notif.createdAt
                                    ? new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                    : "Just now"}
                                </span>
                              </div>
                              <p className="text-xs mt-1 line-clamp-2 text-muted-foreground/70">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        );
                        const className = "block px-4 py-3 transition-colors cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted bg-card";

                        return notif.link ? (
                          <Link
                            key={notif._id}
                            href={notif.link}
                            className={className}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div
                            key={notif._id}
                            className={className}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            {content}
                          </div>
                        );
                      })}
                  </>
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
