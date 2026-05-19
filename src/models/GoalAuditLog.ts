import { Schema, model, models, type InferSchemaType } from "mongoose";

const goalAuditLogSchema = new Schema(
  {
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    goalTitle: { type: String, required: true },
    taskName: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g., "EDITED_AFTER_APPROVAL"
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    comment: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "goal_audit_logs" },
);

goalAuditLogSchema.index({ goalId: 1 });

export type GoalAuditLogDocument = InferSchemaType<typeof goalAuditLogSchema>;

export const GoalAuditLog = models.GoalAuditLog || model("GoalAuditLog", goalAuditLogSchema);
