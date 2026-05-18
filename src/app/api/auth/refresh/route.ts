import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionFromCookies,
  setSessionCookie,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.id).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newToken = await createSessionToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department ?? "",
      approvalStatus: user.approvalStatus ?? "Pending Approval",
      onboardingCompleted: user.onboardingCompleted ?? false,
    });

    await setSessionCookie(newToken);

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department ?? "",
        approvalStatus: user.approvalStatus ?? "Pending Approval",
        onboardingCompleted: user.onboardingCompleted ?? false,
      },
    });
  } catch (error) {
    console.error("[auth/refresh]", error);
    return NextResponse.json({ error: "Failed to refresh session." }, { status: 500 });
  }
}
