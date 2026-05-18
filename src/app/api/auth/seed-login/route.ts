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
    }>();

    if (!user) {
      return Response.json(
        { error: "Seed user not found. Did you run the seed script?" },
        { status: 404 },
      );
    }

    // Auto-authenticate without OTP checks
    const sessionUser = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: (user.role ?? "employee") as Role,
      department: user.department ?? "",
    };

    // Create session/token
    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

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
      }),
    });
  } catch (error) {
    console.error("[auth/seed-login]", error);
    return Response.json({ error: "Seed login failed." }, { status: 500 });
  }
}
