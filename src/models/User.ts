import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee",
    },
    department: { type: String, default: "", trim: true },
    team: { type: String, default: "", trim: true },
    verified: { type: Boolean, default: false },
    isSeedUser: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
  },
  { timestamps: true, collection: "users" }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User = models.User || model("User", userSchema);
