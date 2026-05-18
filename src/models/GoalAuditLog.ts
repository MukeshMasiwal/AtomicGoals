import { Schema, model, models, type InferSchemaType } from "mongoose";

const goalAuditLogSchema = new Schema(
  {
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "QUARTERLY_UPDATE", "GOAL_CREATED"
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "goal_audit_logs" },
);

goalAuditLogSchema.index({ goalId: 1 });

export type GoalAuditLogDocument = InferSchemaType<typeof goalAuditLogSchema>;

export const GoalAuditLog = models.GoalAuditLog || model("GoalAuditLog", goalAuditLogSchema);
