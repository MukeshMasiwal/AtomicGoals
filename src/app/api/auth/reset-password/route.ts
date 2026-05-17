import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashResetToken } from "@/lib/tokens";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    await connectDB();
    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return Response.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Set new password and clear token fields
    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return Response.json({ message: "Password has been successfully updated" });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: "An error occurred" }, { status: 500 });
  }
}
