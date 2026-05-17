import { Schema, model, models, type InferSchemaType } from "mongoose";

const goalSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    weight: { type: Number, default: 0, min: 0, max: 100 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    deadline: { type: Date },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    managerEmail: { type: String, default: "", lowercase: true, trim: true },
    department: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true, collection: "goals" }
);

goalSchema.index({ ownerId: 1 });
goalSchema.index({ department: 1 });
goalSchema.index({ ownerEmail: 1 });

export type GoalDocument = InferSchemaType<typeof goalSchema>;

export const Goal = models.Goal || model("Goal", goalSchema);
