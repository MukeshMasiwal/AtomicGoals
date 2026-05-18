import { NextResponse } from "next/server";
import {
  getSessionFromCookies,
  setSessionCookie,
  createSessionToken,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, jobTitle, department, manager, team } =
      await req.json();

    if (!firstName || !lastName || !jobTitle) {
      return NextResponse.json(
        { error: "First Name, Last Name, and Job Title are required." },
        { status: 400 },
      );
    }

    await connectDB();
    const fullName = `${firstName} ${lastName}`.trim();

    const updatedUser = await User.findByIdAndUpdate(
      session.id,
      {
        name: fullName,
        firstName,
        lastName,
        jobTitle,
        department: department || "",
        manager,
        team,
        onboardingCompleted: true,
      },
      { new: true },
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newToken = await createSessionToken({
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      department: updatedUser.department,
    });

    await setSessionCookie(newToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding." },
      { status: 500 },
    );
  }
}
