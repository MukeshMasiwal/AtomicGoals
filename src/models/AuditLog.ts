import { Schema, model, models, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true, trim: true },
    actorEmail: { type: String, required: true, lowercase: true, trim: true },
    targetType: { type: String, default: "" },
    targetId: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "audit_logs" },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorEmail: 1 });

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;

export const AuditLog = models.AuditLog || model("AuditLog", auditLogSchema);
