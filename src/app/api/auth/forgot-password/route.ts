import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateResetToken } from "@/lib/tokens";
import { sendMail, getResetPasswordHtml } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return a success response even if user not found for security purposes
      return Response.json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const { token, hashedToken } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/reset-password/${token}`;

    await sendMail({
      to: user.email,
      subject: "GoalTrack - Password Reset Request",
      html: getResetPasswordHtml(resetUrl),
    });

    return Response.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "An error occurred" }, { status: 500 });
  }
}
