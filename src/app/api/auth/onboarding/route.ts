import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSessionFromCookies, setSessionCookie, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, department, managerId } = body;

    if (!firstName || !lastName || !department || !managerId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const updateData: any = {
      firstName,
      lastName,
      department,
      onboardingCompleted: true,
      verified: true,
      approvalStatus: "Pending Approval",
    };

    if (managerId) {
      updateData.assignedManager = managerId;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { createNotification, notifyAdmins } = await import("@/lib/notifications");

    await notifyAdmins({
      type: "Employee Approved", // Representing user app
      title: "New User Application",
      message: `New employee application submitted by ${firstName} ${lastName}`,
      link: "/dashboard/team",
      relatedUser: updatedUser._id.toString(),
    });

    // Also notify the assigned manager
    if (managerId) {
      await createNotification({
        type: "Employee Approved",
        title: "New Team Member Application",
        message: `${firstName} ${lastName} has selected you as their manager and is waiting for approval.`,
        recipient: managerId,
        link: "/dashboard/team",
        relatedUser: updatedUser._id.toString(),
      });
    }

    // Update session token
    const newSessionUser = {
      ...session,
      name: `${firstName} ${lastName}`,
      department,
      onboardingCompleted: true,
      approvalStatus: "Pending Approval" as const,
      verified: true,
      isSeedUser: !!(session as any).isSeedUser,
    };

    const token = await createSessionToken(newSessionUser);
    await setSessionCookie(token);

    return Response.json({ success: true });
  } catch (error) {
    console.error("[auth/onboarding]", error);
    return Response.json({ error: "Failed to process onboarding" }, { status: 500 });
  }
}
