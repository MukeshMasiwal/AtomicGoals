import { Schema, model, models, type InferSchemaType } from "mongoose";

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      trim: true,
      default: "Engineering",
    },
    manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, collection: "teams" },
);

export type TeamDocument = InferSchemaType<typeof teamSchema>;

export const Team = models.Team || model("Team", teamSchema);
