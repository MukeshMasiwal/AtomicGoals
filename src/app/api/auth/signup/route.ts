import { logAudit } from "@/lib/audit";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  sessionPayloadToUser,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { Role } from "@/types";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  department?: string;
  role?: Role;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SignupBody;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "General";

  if (!name || !email || !password) {
    return Response.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const role: Role =
    body.role === "manager" || body.role === "admin" ? body.role : "employee";

  try {
    await connectDB();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return Response.json({ error: "Email already registered." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role,
      department,
    });

    const sessionUser = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role as Role,
      department: user.department ?? "",
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    await logAudit({
      action: "user.signup",
      actorEmail: user.email,
      targetType: "user",
      targetId: String(user._id),
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
    console.error("[auth/signup]", error);
    return Response.json({ error: "Signup failed." }, { status: 500 });
  }
}
