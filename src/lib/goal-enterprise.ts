import type { Role } from "@/types";

export type QuarterlyWindowKey = "goal-setting" | "q1-check-in" | "q2-check-in" | "q3-check-in" | "annual-check-in" | "closed";
export type KpiType = "min" | "max" | "timeline" | "zero";
export type QuarterlyStatus = "not-started" | "on-track" | "completed";

export type QuarterlyScoreInput = {
  kpiType?: string | null;
  plannedTargetValue?: number | null;
  actualAchievementValue?: number | null;
  dueDate?: string | Date | null;
  completionDate?: string | Date | null;
};

export type EnterpriseGoalLike = {
  _id?: unknown;
  title?: string;
  creator?: unknown;
  assignedTo?: unknown[];
  team?: unknown;
  contributingTeams?: unknown[];
  contributionPermissions?: string[] | string | null;
  goalWeightage?: number | null;
  contributionPercentage?: number | null;
  numberOfTasks?: number | null;
  progress?: number | null;
  status?: string | null;
  approvalStatus?: string | null;
  department?: string | null;
  assignedManager?: unknown;
  dueDate?: string | Date | null;
  kpiType?: string | null;
  plannedTargetValue?: number | null;
  actualAchievementValue?: number | null;
  plannedTarget?: string | null;
  actualAchievement?: string | null;
  quarterlyStatus?: string | null;
  completionPercentage?: number | null;
  score?: number | null;
};

export type EnterpriseGoalValidationResult =
  | {
      valid: true;
      effectiveWeightages: Array<{ goalId: string; weightage: number }>;
      totalWeightage: number;
      activeGoalCount: number;
    }
  | {
      valid: false;
      error: string;
    };

function toIdString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("_id" in obj) {
      const id = (obj as { _id?: unknown })._id;
      // Guard against circular references or self-references
      if (id === value) return "";
      if (id == null) return "";
      if (typeof id === "string") return id;
      if (typeof id === "number") return String(id);
      if (typeof id === "object") {
        // Prefer a custom toString if available, but avoid recursing back into this helper
        if (typeof (id as any).toString === "function" && (id as any).toString !== Object.prototype.toString) {
          try {
            const s = (id as any).toString();
            if (typeof s === "string") return s;
          } catch {}
        }
        return "";
      }
    }
    if (typeof obj.toString === "function" && obj.toString !== Object.prototype.toString) {
      try {
        const s = obj.toString();
        if (typeof s === "string") return s;
      } catch {}
    }
  }
  return "";
}

function toIdList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map(toIdString).filter(Boolean);
}

function clampScore(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function diffDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function getQuarterlyWindow(date: Date = new Date()): {
  key: QuarterlyWindowKey;
  label: string;
  open: boolean;
  locked: boolean;
  allowedActions: string[];
  message: string;
} {
  const month = date.getMonth() + 1;

  if (month === 5) {
    return {
      key: "goal-setting",
      label: "Goal setting",
      open: true,
      locked: false,
      allowedActions: ["goal-setting", "approval"],
      message: "Goal setting window is open.",
    };
  }

  if (month === 7) {
    return {
      key: "q1-check-in",
      label: "Q1 check-in",
      open: true,
      locked: false,
      allowedActions: ["planned-vs-actual", "progress-update", "comment"],
      message: "Q1 check-in window is open.",
    };
  }

  if (month === 10) {
    return {
      key: "q2-check-in",
      label: "Q2 check-in",
      open: true,
      locked: false,
      allowedActions: ["progress-update", "comment"],
      message: "Q2 check-in window is open.",
    };
  }

  if (month === 1) {
    return {
      key: "q3-check-in",
      label: "Q3 check-in",
      open: true,
      locked: false,
      allowedActions: ["progress-update", "comment"],
      message: "Q3 check-in window is open.",
    };
  }

  if (month === 3 || month === 4) {
    return {
      key: "annual-check-in",
      label: "Annual check-in",
      open: true,
      locked: false,
      allowedActions: ["final-achievement", "comment"],
      message: "Annual check-in window is open.",
    };
  }

  return {
    key: "closed",
    label: "Closed",
    open: false,
    locked: true,
    allowedActions: [],
    message: "Quarterly check-in window currently closed.",
  };
}

export function isQuarterlyWindowOpen(date: Date = new Date()): boolean {
  return getQuarterlyWindow(date).open;
}

export function canMutateQuarterlyData(
  date: Date = new Date(),
  role: Role | "admin" | "manager" | "employee" = "employee",
): boolean {
  const window = getQuarterlyWindow(date);
  if (window.open) return true;
  return role === "admin";
}

export function computeKpiScore(input: QuarterlyScoreInput): number {
  const kpiType = (input.kpiType || "min").toLowerCase() as KpiType;
  const planned = Number(input.plannedTargetValue ?? 0);
  const actual = Number(input.actualAchievementValue ?? 0);
  const dueDate = toDate(input.dueDate);
  const completionDate = toDate(input.completionDate);

  switch (kpiType) {
    case "max":
      if (actual <= 0) return planned <= 0 ? 100 : 0;
      return clampScore((planned / actual) * 100);
    case "timeline": {
      if (!dueDate || !completionDate) return 0;
      if (completionDate <= dueDate) return 100;
      const daysLate = diffDays(completionDate, dueDate);
      return clampScore(100 - daysLate * 10);
    }
    case "zero":
      return actual === 0 ? 100 : 0;
    case "min":
    default:
      if (planned <= 0) return actual <= 0 ? 100 : 0;
      return clampScore((actual / planned) * 100);
  }
}

export function deriveQuarterlyStatus(
  input: QuarterlyScoreInput & { existingStatus?: string | null },
): QuarterlyStatus {
  const score = computeKpiScore(input);
  if (score >= 100) return "completed";
  if (score > 0) return "on-track";

  const existingStatus = (input.existingStatus || "").toLowerCase();
  if (existingStatus === "completed") return "completed";
  if (existingStatus === "on-track" || existingStatus === "in-progress") return "on-track";
  return "not-started";
}

export function normalizeQuarterlyStatus(status?: string | null): QuarterlyStatus {
  const normalized = (status || "").toLowerCase();
  if (normalized === "completed") return "completed";
  if (normalized === "on-track" || normalized === "in-progress" || normalized === "at-risk") {
    return "on-track";
  }
  return "not-started";
}

export function isQuarterlyRestrictedMutation(update: Record<string, unknown>): boolean {
  return [
    "plannedTarget",
    "plannedTargetValue",
    "actualAchievement",
    "actualAchievementValue",
    "quarterlyStatus",
    "progress",
    "status",
    "kpiType",
    "completionDate",
    "quarterlyTarget",
  ].some((key) => key in update);
}

export function getQuarterLabel(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (month === 7) return `Q1 ${year}`;
  if (month === 10) return `Q2 ${year}`;
  if (month === 1) return `Q3 ${year}`;
  if (month === 3 || month === 4) return `Q4 ${year}`;
  if (month === 5) return `Goal Setting ${year}`;
  return `Q${Math.ceil(month / 3)} ${year}`;
}

export function isEnterpriseActiveGoal(goal: EnterpriseGoalLike): boolean {
  const approvalStatus = goal.approvalStatus ?? "Draft";
  const status = goal.status ?? "not-started";
  return approvalStatus !== "Rejected" && status !== "completed";
}

export function getGoalWeightage(goal: EnterpriseGoalLike): number | null {
  return typeof goal.goalWeightage === "number" && !Number.isNaN(goal.goalWeightage)
    ? goal.goalWeightage
    : null;
}

export function getGoalFallbackWeightage(goalCount: number): number {
  if (goalCount <= 0) return 0;
  return Math.round((100 / goalCount) * 10) / 10;
}

export function getGoalWeightageDisplay(goal: EnterpriseGoalLike, fallback = 10): number {
  const weightage = getGoalWeightage(goal);
  if (weightage !== null) return weightage;
  return fallback;
}

export function getGoalContributingTeamIds(goal: EnterpriseGoalLike): string[] {
  const contributingTeams = toIdList(goal.contributingTeams);
  if (contributingTeams.length > 0) return contributingTeams;

  const teamId = toIdString(goal.team);
  return teamId ? [teamId] : [];
}

export function getGoalContributionPermissions(goal: EnterpriseGoalLike): string[] {
  if (Array.isArray(goal.contributionPermissions)) {
    return goal.contributionPermissions.filter(Boolean);
  }
  if (typeof goal.contributionPermissions === "string" && goal.contributionPermissions) {
    return [goal.contributionPermissions];
  }
  return ["team-members"];
}

export function normalizeGoalForResponse(goal: EnterpriseGoalLike, fallbackWeightage = 10) {
  const numberOfTasks = Math.max(Number(goal.numberOfTasks || 1), 1);
  const goalWeightage = getGoalWeightageDisplay(goal, fallbackWeightage);
  return {
    ...goal,
    goalWeightage: getGoalWeightage(goal),
    effectiveGoalWeightage: goalWeightage,
    contributionPercentage: goal.contributionPercentage ?? Math.round(goalWeightage / numberOfTasks),
    contributingTeams: getGoalContributingTeamIds(goal),
    contributionPermissions: getGoalContributionPermissions(goal),
    taskContributionWeight: Math.round((goalWeightage / numberOfTasks) * 10) / 10,
  };
}

export function resolveEnterpriseGoalWeights(goals: EnterpriseGoalLike[]): EnterpriseGoalValidationResult {
  const activeGoals = goals.filter(isEnterpriseActiveGoal);
  const explicitWeights = activeGoals.map((goal) => ({
    goalId: toIdString(goal._id),
    weightage: getGoalWeightage(goal),
  }));

  const explicitTotal = explicitWeights.reduce(
    (sum, item) => sum + (item.weightage ?? 0),
    0,
  );
  const missingGoals = explicitWeights.filter((item) => item.weightage === null);

  if (explicitTotal > 100) {
    return {
      valid: false,
      error: "Total goal weightage must equal 100%.",
    };
  }

  if (activeGoals.length > 8) {
    return {
      valid: false,
      error: "Maximum 8 goals allowed per employee.",
    };
  }

  if (missingGoals.length === 0) {
    // During drafting, it's fine if the total is < 100. It just can't be > 100.
    // The final submission validation will check if it strictly equals 100%.

    const invalidGoal = explicitWeights.find((item) => (item.weightage ?? 0) < 10);
    if (invalidGoal) {
      return {
        valid: false,
        error: "Each goal must have at least 10% weightage.",
      };
    }

    return {
      valid: true,
      effectiveWeightages: explicitWeights.map((item) => ({
        goalId: item.goalId,
        weightage: item.weightage ?? 0,
      })),
      totalWeightage: explicitTotal,
      activeGoalCount: activeGoals.length,
    };
  }

  const remainingWeightage = 100 - explicitTotal;
  if (remainingWeightage < 0) {
    return {
      valid: false,
      error: "Total goal weightage must equal 100%.",
    };
  }

  const fallbackWeightage = remainingWeightage / missingGoals.length;
  if (fallbackWeightage < 10) {
    return {
      valid: false,
      error: "Each goal must have at least 10% weightage.",
    };
  }

  return {
    valid: true,
    effectiveWeightages: explicitWeights.map((item) => ({
      goalId: item.goalId,
      weightage: item.weightage ?? fallbackWeightage,
    })),
    totalWeightage: 100,
    activeGoalCount: activeGoals.length,
  };
}

export function calculateWeightedProgress(goals: EnterpriseGoalLike[]) {
  const validation = resolveEnterpriseGoalWeights(goals);
  const activeGoals = goals.filter(isEnterpriseActiveGoal);

  if (!validation.valid) {
    const averageProgress = activeGoals.length
      ? Math.round(
          activeGoals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) /
            activeGoals.length,
        )
      : 0;

    return {
      weightedProgress: averageProgress,
      totalWeightage: 0,
      validation,
    };
  }

  const weightByGoalId = new Map(
    validation.effectiveWeightages.map((item) => [item.goalId, item.weightage]),
  );
  const weightedProgress = activeGoals.length
    ? Math.round(
        activeGoals.reduce((sum, goal) => {
          const goalId = toIdString(goal._id);
          const weightage = weightByGoalId.get(goalId) ?? getGoalFallbackWeightage(activeGoals.length);
          return sum + Number(goal.progress || 0) * (weightage / 100);
        }, 0),
      )
    : 0;

  return {
    weightedProgress,
    totalWeightage: validation.totalWeightage,
    validation,
  };
}

export function calculateQuarterlyCompletionPercent(params: {
  plannedTargetValue?: number | null;
  actualAchievementValue?: number | null;
  kpiType?: string | null;
  dueDate?: string | Date | null;
  completionDate?: string | Date | null;
}): number {
  return computeKpiScore(params);
}

export function computeQuarterlyWorkflowState(goal: EnterpriseGoalLike) {
  const score = calculateQuarterlyCompletionPercent({
    plannedTargetValue: goal.plannedTargetValue ?? goal.contributionPercentage ?? 0,
    actualAchievementValue: goal.actualAchievementValue ?? goal.progress ?? 0,
    kpiType: goal.kpiType ?? "min",
    dueDate: goal.dueDate,
  });

  const quarterlyStatus = normalizeQuarterlyStatus(goal.quarterlyStatus ?? goal.status);

  return {
    score,
    quarterlyStatus,
    completionPercentage:
      typeof goal.completionPercentage === "number"
        ? goal.completionPercentage
        : score,
    kpiType: (goal.kpiType || "min") as KpiType,
  };
}

export function canEmployeeMutateGoal(goal: EnterpriseGoalLike, user: { id: string; team?: unknown }) {
  const userTeamId = toIdString(user.team);
  const goalTeamIds = getGoalContributingTeamIds(goal);
  const assignedTo = toIdList(goal.assignedTo);
  const creatorId = toIdString(goal.creator);

  if (goalTeamIds.length > 0) {
    return goalTeamIds.includes(userTeamId);
  }

  return creatorId === user.id || assignedTo.includes(user.id);
}

export function canManagerManageGoal(
  goal: EnterpriseGoalLike,
  user: { id: string; department?: string; team?: unknown },
  teamContext?: { manager?: unknown; department?: string },
) {
  if (toIdString(teamContext?.manager) === user.id) return true;
  if ((teamContext?.department || "") && (teamContext?.department || "") === (user.department || "")) {
    return true;
  }

  const goalDepartment = goal.department || teamContext?.department || "";
  return goalDepartment === (user.department || "");
}

export function buildGoalTeamAccessSnapshot(goal: EnterpriseGoalLike) {
  return {
    contributingTeams: getGoalContributingTeamIds(goal),
    contributionPermissions: getGoalContributionPermissions(goal),
    taskContributionWeight: normalizeGoalForResponse(goal).taskContributionWeight,
  };
}
