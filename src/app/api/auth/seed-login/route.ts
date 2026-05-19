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

const DEMO_USERS: Record<string, { name: string; role: Role }> = {
  "admin@atomicgoals.com": { name: "Admin User", role: "admin" },
  "alice.eng@atomicgoals.com": { name: "Alice Engineer", role: "manager" },
  "charlie.eng@atomicgoals.com": { name: "Charlie Coder", role: "employee" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    await connectDB();

    // Find the seed user
    const user = await User.findOne({ email }).lean<{
      _id: { toString(): string };
      email: string;
      name: string;
      role?: Role;
      department?: string;
      approvalStatus?: "Pending Approval" | "Approved" | "Rejected";
      onboardingCompleted?: boolean;
    }>();

    if (!user) {
      return Response.json(
        { error: "Seed user not found. Did you run the seed script?" },
        { status: 404 },
      );
    }

    const demoProfile = DEMO_USERS[email] || null;
    if (demoProfile && user.name !== demoProfile.name) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            name: demoProfile.name,
            role: demoProfile.role,
            verified: true,
            isSeedUser: true,
            onboardingCompleted: true,
            approvalStatus: "Approved",
          },
        },
      );

      user.name = demoProfile.name;
      user.role = demoProfile.role;
      user.onboardingCompleted = true;
      user.approvalStatus = "Approved";

      console.log("[AUTH] Normalized demo user profile", {
        email,
        name: demoProfile.name,
        role: demoProfile.role,
      });
    }

    // Auto-authenticate without OTP checks
    const sessionUser = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: (user.role ?? "employee") as Role,
      department: user.department ?? "",
      approvalStatus: user.approvalStatus ?? "Pending Approval",
      onboardingCompleted: user.onboardingCompleted ?? false,
      verified: (user as any).verified ?? true,
      isSeedUser: true,
    };

    // Create session/token
    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    const redirectTo = resolveAuthRedirectPath({
      approvalStatus: sessionUser.approvalStatus,
      onboardingCompleted: sessionUser.onboardingCompleted,
      verified: sessionUser.verified,
      isSeedUser: sessionUser.isSeedUser,
    });

    console.log("[AUTH] Seed login", {
      email: user.email,
      role: sessionUser.role,
      redirectTo,
    });

    // Log the audit event for demo
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
        verified: sessionUser.verified,
        isSeedUser: sessionUser.isSeedUser,
      }),
      redirectTo,
    });
  } catch (error) {
    console.error("[auth/seed-login]", error);
    return Response.json({ error: "Seed login failed." }, { status: 500 });
  }
}
