export type Role = "employee" | "manager" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  approvalStatus: "Pending Approval" | "Approved" | "Rejected";
  onboardingCompleted?: boolean;
};

export type GoalStatus = "draft" | "pending" | "approved" | "rejected";
