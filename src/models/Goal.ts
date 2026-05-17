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
        validator: function (v: Date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v >= today;
        },
        message: "Deadline cannot be set in the past."
      }
    },
    assignedManager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    approvalStatus: {
      type: String,
      enum: ["Draft", "Pending Approval", "Approved", "Rejected", "Completed"],
      default: "Draft",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvalComments: { type: String, default: "" },
  },
  { timestamps: true, collection: "goals" }
);

goalSchema.index({ creator: 1 });
goalSchema.index({ assignedTo: 1 });
goalSchema.index({ team: 1 });
goalSchema.index({ assignedManager: 1 });

export type GoalDocument = InferSchemaType<typeof goalSchema>;

export const Goal = models.Goal || model("Goal", goalSchema);
