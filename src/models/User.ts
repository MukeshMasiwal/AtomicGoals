import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
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
    jobTitle: { type: String, default: "", trim: true },
    department: { type: String, default: "", trim: true },
    team: { type: String, default: "", trim: true },
    avatar: { type: String, default: "" },
    notifications: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        type: { type: String },
        link: { type: String }
      }
    ],
    onboardingCompleted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    isSeedUser: { type: Boolean, default: false },
    password: { type: String, select: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
  },
  { timestamps: true, collection: "users" }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User = models.User || model("User", userSchema);
