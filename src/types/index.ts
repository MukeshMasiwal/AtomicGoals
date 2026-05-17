export type Role = "employee" | "manager" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
};

export type GoalStatus = "draft" | "pending" | "approved" | "rejected";
