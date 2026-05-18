import { logAudit } from "@/lib/audit";
import {
  createSessionToken,
  setSessionCookie,
  sessionPayloadToUser,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { Role } from "@/types";
import { resolveAuthRedirectPath } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();

    if (!email || !otp) {
      return Response.json(
        { error: "Email and OTP are required." },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await User.findOne({ email }).select("+otp +otpExpiry").lean<{
      _id: { toString(): string };
      email: string;
      name: string;
      role?: Role;
      department?: string;
      otp?: string;
      otpExpiry?: Date;
      approvalStatus?: "Pending Approval" | "Approved" | "Rejected";
      onboardingCompleted?: boolean;
    }>();

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.otp || user.otp !== otp) {
      return Response.json({ error: "Invalid OTP." }, { status: 401 });
    }

    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      return Response.json({ error: "OTP has expired." }, { status: 401 });
    }

    console.log("[AUTH] OTP verified", {
      email,
      userId: String(user._id),
      onboardingCompleted: user.onboardingCompleted ?? false,
      approvalStatus: user.approvalStatus ?? "Pending Approval",
    });

    // Clear OTP after successful verification
    await User.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpiry: 1 } },
    );

    const sessionUser = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: (user.role ?? "employee") as Role,
      department: user.department ?? "",
      approvalStatus: user.approvalStatus ?? "Pending Approval",
      onboardingCompleted: user.onboardingCompleted ?? false,
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    const redirectTo = resolveAuthRedirectPath({
      approvalStatus: sessionUser.approvalStatus,
      onboardingCompleted: sessionUser.onboardingCompleted,
    });

    console.log("[AUTH] Session created", {
      email,
      userId: sessionUser.id,
      redirectTo,
    });

    await logAudit({
      action: "user.login",
      actorEmail: user.email,
      targetType: "user",
      targetId: sessionUser.id,
    });

    return Response.json({
      ok: true,
      user: sessionPayloadToUser({
        sub: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        role: sessionUser.role,
        department: sessionUser.department,
        approvalStatus: sessionUser.approvalStatus,
        onboardingCompleted: sessionUser.onboardingCompleted,
      }),
      redirectTo,
    });
  } catch (error) {
    console.error("[auth/verify-otp]", error);
    return Response.json({ error: "Verification failed." }, { status: 500 });
  }
}
