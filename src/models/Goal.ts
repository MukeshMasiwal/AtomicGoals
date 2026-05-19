import { Schema, model, models, type InferSchemaType } from "mongoose";

const goalSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: any, v: Date) {
          if (!this.isModified('dueDate')) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v >= today;
        },
        message: "Deadline cannot be set in the past.",
      },
    },
    assignedManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: { type: String, default: "" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    numberOfTasks: { type: Number, default: 1, min: 1 },
    tasksCompleted: { type: Number, default: 0, min: 0 },
    goalWeightage: { type: Number, min: 0, max: 100 },
    contributionPercentage: { type: Number, min: 0, max: 100 },
    contributingTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    contributionPermissions: {
      type: [String],
      default: ["team-members"],
    },
    quarterlyTarget: { type: String, default: "" },
    actualAchievement: { type: String, default: "" },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "at-risk"],
      default: "not-started",
    },
    approvalStatus: {
      type: String,
      enum: ["Draft", "Pending Approval", "Approved", "Rejected", "Completed"],
      default: "Draft",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvalComments: { type: String, default: "" },
    kpiType: {
      type: String,
      enum: ["min", "max", "timeline", "zero"],
      default: "min",
    },
    uom: {
      type: String,
      enum: ["Numeric", "Percentage", "Timeline", "Zero-Based"],
      default: "Numeric",
    },
    thrustArea: { type: String, default: "" },
    isLocked: { type: Boolean, default: false },
    isShared: { type: Boolean, default: false },
    sharedGoalGroupId: { type: String, default: "" },
    primaryOwnerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    plannedTargetValue: { type: Number, default: null },
    actualAchievementValue: { type: Number, default: null },
    quarterlyStatus: {
      type: String,
      enum: ["not-started", "on-track", "completed"],
      default: "not-started",
    },
    completionDate: { type: Date, default: null },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    score: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true, collection: "goals" },
);

goalSchema.index({ creator: 1 });
goalSchema.index({ assignedTo: 1 });
goalSchema.index({ team: 1 });
goalSchema.index({ assignedManager: 1 });
goalSchema.index({ contributingTeams: 1 });

export type GoalDocument = InferSchemaType<typeof goalSchema>;

export const Goal = models.Goal || model("Goal", goalSchema);
