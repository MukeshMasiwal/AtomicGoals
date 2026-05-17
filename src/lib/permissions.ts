import type { FilterQuery } from "mongoose";

import type { SessionUser } from "@/types";

export type GoalAccess = {
  ownerId?: string;
  ownerEmail?: string;
  department?: string;
  managerEmail?: string;
};

export function getGoalsFilter(user: SessionUser): FilterQuery<GoalAccess> {
  if (user.role === "admin") {
    return {};
  }

  if (user.role === "manager") {
    return {
      $or: [
        { department: user.department },
        { managerEmail: user.email },
        { ownerEmail: user.email },
      ],
    };
  }

  return {
    $or: [{ ownerId: user.id }, { ownerEmail: user.email }],
  };
}

export function canAccessGoal(user: SessionUser, goal: GoalAccess): boolean {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "manager") {
    return (
      goal.department === user.department ||
      goal.managerEmail === user.email ||
      goal.ownerEmail === user.email
    );
  }

  return goal.ownerId === user.id || goal.ownerEmail === user.email;
}

export function canManageUsers(user: SessionUser): boolean {
  return user.role === "admin";
}

export function canViewAuditLogs(user: SessionUser): boolean {
  return user.role === "admin";
}

export function canViewTeamReports(user: SessionUser): boolean {
  return user.role === "manager" || user.role === "admin";
}

export function canApproveGoals(user: SessionUser): boolean {
  return user.role === "manager" || user.role === "admin";
}
