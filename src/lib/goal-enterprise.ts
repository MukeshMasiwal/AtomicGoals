import type { Role } from "@/types";

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
    if (Math.round(explicitTotal * 10) / 10 !== 100) {
      return {
        valid: false,
        error: "Total goal weightage must equal 100%.",
      };
    }

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
      totalWeightage: 100,
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
