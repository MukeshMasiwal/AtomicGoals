import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models/AuditLog";

type AuditParams = {
  action: string;
  actorEmail: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export async function logAudit({
  action,
  actorEmail,
  targetType = "",
  targetId = "",
  metadata = {},
}: AuditParams): Promise<void> {
  await connectDB();
  await AuditLog.create({
    action,
    actorEmail,
    targetType,
    targetId,
    metadata,
  });
}
