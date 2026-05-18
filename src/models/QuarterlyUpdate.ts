import { Schema, model, models, type InferSchemaType } from "mongoose";

const quarterlyUpdateSchema = new Schema(
  {
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    quarter: { type: String, required: true, trim: true },
    kpiType: {
      type: String,
      enum: ["min", "max", "timeline", "zero"],
      default: "min",
    },
    plannedTarget: { type: String, default: "" },
    plannedTargetValue: { type: Number, default: null },
    actualAchievement: { type: String, default: "" },
    actualAchievementValue: { type: Number, default: null },
    status: {
      type: String,
      enum: ["not-started", "on-track", "completed"],
      default: "not-started",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    score: { type: Number, default: 0, min: 0, max: 100 },
    summary: { type: String, default: "" },
    managerComment: { type: String, default: "" },
    comments: {
      type: [
        {
          text: { type: String, required: true },
          authorId: { type: String, required: true },
          authorName: { type: String, required: true },
          authorRole: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    submittedBy: { type: String, required: true, lowercase: true, trim: true },
    reviewedBy: { type: String, default: "" },
    department: { type: String, default: "", trim: true },
    team: { type: String, default: "", trim: true },
    managerId: { type: String, default: "", trim: true },
    lockedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "quarterly_updates" },
);

quarterlyUpdateSchema.index({ goalId: 1, quarter: 1 });

export type QuarterlyUpdateDocument = InferSchemaType<
  typeof quarterlyUpdateSchema
>;

export const QuarterlyUpdate =
  models.QuarterlyUpdate || model("QuarterlyUpdate", quarterlyUpdateSchema);
