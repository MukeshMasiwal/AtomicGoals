import { logAudit } from "@/lib/audit";
import {
  createSessionToken,
  setSessionCookie,
  sessionPayloadToUser,
  verifyPassword,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { Role } from "@/types";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    await connectDB();
    const user = await User.findOne({ email }).select("+password").lean<{
      _id: { toString(): string };
      email: string;
      name: string;
      password: string;
      role?: Role;
      department?: string;
      approvalStatus?: "Pending Approval" | "Approved" | "Rejected";
      onboardingCompleted?: boolean;
    }>();

    if (!user?.password) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(password, user.password);
    if (!passwordMatches) {
      return Response.json({ error: "Invalid credentials." }, { status: 401 });
    }

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
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return Response.json({ error: "Login failed." }, { status: 500 });
  }
}
