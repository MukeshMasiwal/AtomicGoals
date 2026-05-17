import { logAudit } from "@/lib/audit";
import {
  createSessionToken,
  setSessionCookie,
  sessionPayloadToUser,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { Role } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();

    if (!email || !otp) {
      return Response.json(
        { error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email }).select("+otp +otpExpire").lean<{
      _id: { toString(): string };
      email: string;
      name: string;
      role?: Role;
      department?: string;
      otp?: string;
      otpExpire?: Date;
    }>();

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.otp || user.otp !== otp) {
      return Response.json({ error: "Invalid OTP." }, { status: 401 });
    }

    if (!user.otpExpire || new Date() > new Date(user.otpExpire)) {
      return Response.json({ error: "OTP has expired." }, { status: 401 });
    }

    // Clear OTP after successful verification
    await User.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpire: 1 } }
    );

    const sessionUser = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: (user.role ?? "employee") as Role,
      department: user.department ?? "",
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

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
      }),
    });
  } catch (error) {
    console.error("[auth/verify-otp]", error);
    return Response.json({ error: "Verification failed." }, { status: 500 });
  }
}
