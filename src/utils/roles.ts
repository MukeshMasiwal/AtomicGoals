import type { Role } from "@/types";

export const ROLES: Role[] = ["employee", "manager", "admin"];

export function parseRole(value?: string | null): Role {
  if (value === "manager" || value === "admin") return value;
  return "employee";
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "manager":
      return "Manager";
    default:
      return "Employee";
  }
}

export function canAccessTeamAnalytics(role: Role): boolean {
  return role === "manager" || role === "admin";
}

export function canExportReports(role: Role): boolean {
  return role === "manager" || role === "admin";
}

export function canViewAuditLogs(role: Role): boolean {
  return role === "admin";
}
