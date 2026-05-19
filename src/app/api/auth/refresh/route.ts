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
    console.log("[AUTH] Refresh requested", { userId: session.id });

    const user = await User.findById(session.id).lean<{
      _id: { toString(): string };
      email: string;
      name: string;
      role?: "employee" | "manager" | "admin";
      department?: string;
      approvalStatus?: "Pending Approval" | "Approved" | "Rejected";
      onboardingCompleted?: boolean;
      verified?: boolean;
      isSeedUser?: boolean;
    }>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id.toString();

    const newToken = await createSessionToken({
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role ?? "employee",
      department: user.department ?? "",
      approvalStatus: user.approvalStatus ?? "Pending Approval",
      onboardingCompleted: user.onboardingCompleted ?? false,
      verified: user.verified ?? false,
      isSeedUser: !!user.isSeedUser,
    });

    await setSessionCookie(newToken);

    console.log("[AUTH] Session refreshed", {
      userId,
      approvalStatus: user.approvalStatus ?? "Pending Approval",
      onboardingCompleted: user.onboardingCompleted ?? false,
    });

    return NextResponse.json({
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role ?? "employee",
        department: user.department ?? "",
        approvalStatus: user.approvalStatus ?? "Pending Approval",
        onboardingCompleted: user.onboardingCompleted ?? false,
        verified: user.verified ?? false,
        isSeedUser: !!user.isSeedUser,
      },
    });
  } catch (error) {
    console.error("[auth/refresh]", error);
    return NextResponse.json({ error: "Failed to refresh session." }, { status: 500 });
  }
}
