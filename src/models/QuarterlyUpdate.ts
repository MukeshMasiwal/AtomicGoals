import { Schema, model, models, type InferSchemaType } from "mongoose";

const quarterlyUpdateSchema = new Schema(
  {
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    quarter: { type: String, required: true, trim: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    summary: { type: String, default: "" },
    submittedBy: { type: String, required: true, lowercase: true, trim: true },
    department: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "quarterly_updates" }
);

quarterlyUpdateSchema.index({ goalId: 1, quarter: 1 });

export type QuarterlyUpdateDocument = InferSchemaType<typeof quarterlyUpdateSchema>;

export const QuarterlyUpdate =
  models.QuarterlyUpdate || model("QuarterlyUpdate", quarterlyUpdateSchema);
