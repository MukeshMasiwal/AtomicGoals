import { NextResponse } from "next/server";
import { getSessionFromCookies, setSessionCookie, createSessionToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function PUT(req: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, jobTitle, department } = await req.json();

    if (!firstName || !lastName || !jobTitle) {
      return NextResponse.json(
        { error: "First Name, Last Name, and Job Title are required." },
        { status: 400 }
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
      },
      { new: true }
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

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}
